import { Modal, ScrollArea, Code, Loader, Alert, Group, Text, Button, Box, Badge } from "@mantine/core";
import { IconRefresh, IconAlertCircle, IconFileText } from "@tabler/icons-react";
import { useState, useEffect } from "react";

const LogViewerModal = ({ opened, onClose, logData, loading, onRefresh, currentService }) => {
	// Helper function untuk highlight log levels
	const getLogLineColor = (line) => {
		const lowerLine = line.toLowerCase();
		if (lowerLine.includes('error') || lowerLine.includes('fatal')) {
			return '#f44336';
		}
		if (lowerLine.includes('warning') || lowerLine.includes('warn')) {
			return '#ff9800';
		}
		if (lowerLine.includes('info')) {
			return '#4caf50';
		}
		if (lowerLine.includes('debug')) {
			return '#2196f3';
		}
		return '#d4d4d4';
	};

	// Helper function untuk format log line
	const formatLogLine = (line, index) => {
		const color = getLogLineColor(line);
		return (
			<div
				key={index}
				style={{
					padding: '4px 8px',
					borderLeft: `3px solid ${color}`,
					backgroundColor: color === '#f44336' ? 'rgba(244, 67, 54, 0.05)' : 
									 color === '#ff9800' ? 'rgba(255, 152, 0, 0.05)' : 
									 'transparent',
					fontFamily: 'monospace',
					fontSize: '13px',
					lineHeight: '1.5',
					marginBottom: '2px',
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-word',
				}}
			>
				{line}
			</div>
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group>
					<IconFileText size={20} />
					<Text fw={600}>Service Logs - {currentService?.name}</Text>
				</Group>
			}
			size="xl"
			padding="md"
		>
			{/* Log Info Header */}
			{logData && !loading && (
				<Box mb="md" p="sm" style={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
					<Group justify="space-between" wrap="wrap">
						<Group gap="md">
							<Text size="sm">
								<strong>File:</strong> {logData.filename}
							</Text>
							<Text size="sm">
								<strong>Lines:</strong> {logData.lines_returned}
							</Text>
						</Group>
						<Button
							size="xs"
							variant="light"
							leftSection={<IconRefresh size={14} />}
							onClick={onRefresh}
							loading={loading}
						>
							Refresh
						</Button>
					</Group>
					{/* <Text size="xs" c="dimmed" mt="xs">
						Last Modified: {logData.file_info.last_modified}
					</Text> */}
				</Box>
			)}

			{/* Loading State */}
			{loading && (
				<Box style={{ textAlign: 'center', padding: '40px' }}>
					<Loader size="md" />
					<Text mt="md" c="dimmed">Loading logs...</Text>
				</Box>
			)}

			{/* Error State */}
			{!loading && !logData && (
				<Alert icon={<IconAlertCircle size={16} />} title="No logs found" color="yellow">
					Unable to load logs for this service.
				</Alert>
			)}

			{/* Log Content */}
			{!loading && logData && logData.logs && (
				<ScrollArea h={500} type="auto">
					<Box
						style={{
							backgroundColor: '#1e1e1e',
							padding: '12px',
							borderRadius: '4px',
							color: '#d4d4d4',
						}}
					>
						{logData.logs.length === 0 ? (
							<Text c="dimmed" ta="center" py="xl">
								No logs available
							</Text>
						) : (
							logData.logs.map((line, index) => formatLogLine(line, index))
						)}
					</Box>
				</ScrollArea>
			)}
		</Modal>
	);
};

export default LogViewerModal;