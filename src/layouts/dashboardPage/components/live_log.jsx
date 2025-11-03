// components/LogViewerModalSSE.jsx

import { useEffect, useRef, useState } from "react";
import {
	Modal,
	ScrollArea,
	Box,
	Text,
	Button,
	Group,
	Badge,
	ActionIcon,
	Alert,
	Loader,
} from "@mantine/core";
import {
	IconPlayerStop,
	IconPlayerPlay,
	IconTrash,
	IconFileText,
	IconAlertCircle,
	IconDownload,
	IconCopy,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const LogViewerModalSSE = ({ opened, onClose, currentService }) => {
	const [logs, setLogs] = useState([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const [fileInfo, setFileInfo] = useState(null);
	const [error, setError] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState("disconnected");
	const eventSourceRef = useRef(null);
	const scrollAreaRef = useRef(null);

	// Auto scroll to bottom
	useEffect(() => {
		if (scrollAreaRef.current) {
			const viewport = scrollAreaRef.current.querySelector(
				"[data-radix-scroll-area-viewport]"
			);
			if (viewport) {
				viewport.scrollTop = viewport.scrollHeight;
			}
		}
	}, [logs]);

	// Build SSE URL
	const buildSSEUrl = () => {
		const baseUrl = "https://watcher.bluegrape.app/webservices/tailServiceLogStream.php";
		const params = new URLSearchParams({
			servicename: currentService.name,
			suffix: "Nas",
			date: new Date().toISOString().split("T")[0],
		});
		return `${baseUrl}?${params.toString()}`;
	};

	// Start streaming
	const startStreaming = () => {
		if (!currentService) return;

		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		setError(null);
		setConnectionStatus("connecting");

		const url = buildSSEUrl();
		console.log("Connecting to SSE:", url);

		const eventSource = new EventSource(url);

		// Handle file info
		eventSource.addEventListener("info", (event) => {
			console.log("Received info:", event.data);
			try {
				const data = JSON.parse(event.data);
				setFileInfo(data);
				setConnectionStatus("connected");
			} catch (err) {
				console.error("Error parsing info:", err);
			}
		});

		// Handle new log lines
		eventSource.addEventListener("log", (event) => {
			try {
				const data = JSON.parse(event.data);
				setLogs((prev) => [...prev, data.line]);
			} catch (err) {
				console.error("Error parsing log:", err);
			}
		});

		// Handle errors from server
		eventSource.addEventListener("error", (event) => {
			console.log("SSE error event:", event);
			if (event.data) {
				try {
					const data = JSON.parse(event.data);
					setError(data.error || "Unknown error");
					setConnectionStatus("error");
				} catch (err) {
					console.error("Error parsing error event:", err);
				}
			}
		});

		// Handle connection errors
		eventSource.onerror = (error) => {
			console.error("Connection error:", error);
			setConnectionStatus("error");
			setError("Connection lost. Click Start to reconnect.");
			eventSource.close();
			setIsStreaming(false);
		};

		eventSource.onopen = () => {
			console.log("SSE connection opened");
			setConnectionStatus("connected");
		};

		eventSourceRef.current = eventSource;
		setIsStreaming(true);
	};

	// Stop streaming
	const stopStreaming = () => {
		if (eventSourceRef.current) {
			console.log("Closing SSE connection");
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}
		setIsStreaming(false);
		setConnectionStatus("disconnected");
	};

	// Clear logs
	const clearLogs = () => {
		setLogs([]);
		notifications.show({
			title: "Cleared",
			message: "Logs cleared",
			color: "blue",
		});
	};

	// Copy logs
	const handleCopyLogs = () => {
		const logsText = logs.join("\n");
		navigator.clipboard.writeText(logsText).then(() => {
			notifications.show({
				title: "Success",
				message: "Logs copied to clipboard",
				color: "green",
			});
		});
	};

	// Download logs
	const handleDownloadLogs = () => {
		const logsText = logs.join("\n");
		const blob = new Blob([logsText], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${currentService.name}-live-${new Date().toISOString()}.log`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		notifications.show({
			title: "Success",
			message: "Logs downloaded",
			color: "green",
		});
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}
		};
	}, []);

	// Auto start when opened
	useEffect(() => {
		if (opened && currentService) {
			startStreaming();
		}
		return () => {
			stopStreaming();
		};
	}, [opened, currentService]);

	// Get status color
	const getStatusColor = () => {
		switch (connectionStatus) {
			case "connected": return "green";
			case "connecting": return "blue";
			case "error": return "red";
			default: return "gray";
		}
	};

	// Get status text
	const getStatusText = () => {
		switch (connectionStatus) {
			case "connected": return "Connected";
			case "connecting": return "Connecting...";
			case "error": return "Error";
			default: return "Disconnected";
		}
	};

	// Get log line color
	const getLogLineColor = (line) => {
		const lowerLine = line.toLowerCase();
		if (lowerLine.includes("error") || lowerLine.includes("fatal"))
			return "#f44336";
		if (lowerLine.includes("warning") || lowerLine.includes("warn"))
			return "#ff9800";
		if (lowerLine.includes("info")) return "#4caf50";
		if (lowerLine.includes("debug")) return "#2196f3";
		return "#d4d4d4";
	};

	// Parse log line
	const parseLogLine = (line) => {
		const match = line.match(
			/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s*-\s*(\w+)\s*-\s*(.*)$/
		);

		if (match) {
			return {
				timestamp: match[1],
				level: match[2],
				message: match[3],
			};
		}

		return {
			timestamp: "",
			level: "",
			message: line,
		};
	};

	// Render log line
	const renderLogLine = (line, index) => {
		const parsed = parseLogLine(line);
		const levelColor = getLogLineColor(line);

		return (
			<div
				key={index}
				style={{
					display: "flex",
					alignItems: "flex-start",
					padding: "6px 8px",
					borderLeft: `3px solid ${levelColor}`,
					backgroundColor:
						parsed.level.toUpperCase() === "ERROR"
							? "rgba(244, 67, 54, 0.05)"
							: parsed.level.toUpperCase() === "WARNING" ||
							  parsed.level.toUpperCase() === "WARN"
							? "rgba(255, 152, 0, 0.05)"
							: "transparent",
					fontFamily: 'Consolas, Monaco, "Courier New", monospace',
					fontSize: "12px",
					lineHeight: "1.6",
					marginBottom: "1px",
					transition: "background-color 0.2s",
				}}
			>
				{parsed.timestamp && (
					<Text
						component="span"
						size="xs"
						c="dimmed"
						style={{ minWidth: "160px", marginRight: "12px", flexShrink: 0 }}
					>
						{parsed.timestamp}
					</Text>
				)}
				{parsed.level && (
					<Badge
						size="xs"
						style={{
							minWidth: "70px",
							marginRight: "12px",
							fontFamily: "monospace",
							backgroundColor: levelColor,
							flexShrink: 0,
						}}
					>
						{parsed.level}
					</Badge>
				)}
				<Text
					component="span"
					size="sm"
					style={{
						flex: 1,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
						color: "#d4d4d4",
					}}
				>
					{parsed.message}
				</Text>
			</div>
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={() => {
				stopStreaming();
				onClose();
			}}
			title={
				<Group>
					<IconFileText size={20} />
					<Text fw={600}>
						Live Logs - {currentService?.name}
					</Text>
				</Group>
			}
			size="xl"
			padding="md"
		>
			{/* Header Info */}
			<Box
				mb="md"
				p="sm"
				style={{ backgroundColor: "#f5f5f5", borderRadius: "4px" }}
			>
				<Group justify="space-between" wrap="wrap">
					<Group gap="md">
						<Badge color={getStatusColor()}>{getStatusText()}</Badge>
						{fileInfo && (
							<>
								<Text size="sm">
									<strong>File:</strong> {fileInfo.filename}
								</Text>
								<Text size="sm">
									<strong>Size:</strong> {fileInfo.size_mb} MB
								</Text>
							</>
						)}
					</Group>
					<Group gap="xs">
						<ActionIcon
							variant="light"
							color="blue"
							onClick={handleCopyLogs}
							title="Copy logs"
							disabled={logs.length === 0}
						>
							<IconCopy size={16} />
						</ActionIcon>
						<ActionIcon
							variant="light"
							color="green"
							onClick={handleDownloadLogs}
							title="Download logs"
							disabled={logs.length === 0}
						>
							<IconDownload size={16} />
						</ActionIcon>
						<ActionIcon
							variant="light"
							color="red"
							onClick={clearLogs}
							title="Clear logs"
							disabled={logs.length === 0}
						>
							<IconTrash size={16} />
						</ActionIcon>
						{isStreaming ? (
							<Button
								size="xs"
								color="red"
								leftSection={<IconPlayerStop size={14} />}
								onClick={stopStreaming}
							>
								Stop
							</Button>
						) : (
							<Button
								size="xs"
								color="green"
								leftSection={<IconPlayerPlay size={14} />}
								onClick={startStreaming}
							>
								Start
							</Button>
						)}
					</Group>
				</Group>
				{fileInfo && (
					<Text size="xs" c="dimmed" mt="xs">
						Last Modified: {fileInfo.last_modified}
					</Text>
				)}
			</Box>

			{/* Error Alert */}
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title="Error"
					color="red"
					mb="md"
					withCloseButton
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			{/* Connecting State */}
			{connectionStatus === "connecting" && (
				<Box style={{ textAlign: "center", padding: "40px" }}>
					<Loader size="md" />
					<Text mt="md" c="dimmed">
						Connecting to log stream...
					</Text>
				</Box>
			)}

			{/* Logs */}
			<ScrollArea h={550} type="auto" ref={scrollAreaRef}>
				<Box
					style={{
						backgroundColor: "#1e1e1e",
						padding: "12px",
						borderRadius: "4px",
						border: "1px solid #333",
						minHeight: "530px",
					}}
				>
					{logs.length === 0 ? (
						<Text c="dimmed" ta="center" py="xl">
							{isStreaming
								? "Waiting for new logs..."
								: "Click Start to begin streaming logs"}
						</Text>
					) : (
						logs.map((line, index) => renderLogLine(line, index))
					)}
				</Box>
			</ScrollArea>

			{/* Footer Stats */}
			<Group justify="space-between" mt="md">
				<Text size="xs" c="dimmed">
					Total lines: {logs.length}
				</Text>
				{isStreaming && (
					<Badge size="sm" variant="dot" color="green">
						Live streaming
					</Badge>
				)}
			</Group>
		</Modal>
	);
};

export default LogViewerModalSSE;