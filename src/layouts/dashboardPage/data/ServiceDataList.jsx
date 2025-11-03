import {
    ActionIcon,
    Badge,
    Group,
    Text,
    Modal,
    ScrollArea,
    Code,
    Loader,
    Alert,
} from "@mantine/core";
import {
    IconEdit,
    IconReportSearch,
    IconTrash,
    IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiGetListService, apiGetServiceLog } from "../../../services/api";

const ServiceDataList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [record, setRecord] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [form, setForm] = useState({});
    const [theState, setTheState] = useState({
        isOponModal: false,
        isLoading: false,
        openEditModal: false,
        openLogModal: false,
        logLoading: false,
        logData: null,
        currentService: null,
    });

    const PAGE_SIZES = [5, 10, 20, 50];

    useEffect(() => {
        getList();
    }, []);

    const getList = async () => {
        setIsLoading(true);
        try {
            const response = await apiGetListService();
            if (response.data.status === "ok") {
                setRecord(response.data.records);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        response.data.messages ||
                        "Failed to load ISP pricing data",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch ISP pricing data",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServiceLog = async (servicename, lines = 30) => {
        setTheState((prev) => ({ ...prev, logLoading: true }));

        try {
            const response = await apiGetServiceLog({
                servicename: servicename,
                suffix: "Nas",
                lines: lines,
            });

            if (response.data.status === "success") {
                setTheState((prev) => ({
                    ...prev,
                    logData: response.data,
                    logLoading: false,
                }));
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data.message || "Failed to load logs",
                });
                setTheState((prev) => ({ ...prev, logLoading: false }));
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch service logs",
            });
            setTheState((prev) => ({ ...prev, logLoading: false }));
        }
    };

    // Handle open log modal
    const handleOpenLogModal = async (record) => {
        setTheState((prev) => ({
            ...prev,
            openLogModal: true,
            currentService: record,
            logData: null,
        }));

        // Fetch log
        await fetchServiceLog(record.name);
    };

    // Handle close log modal
    const handleCloseLogModal = () => {
        setTheState((prev) => ({
            ...prev,
            openLogModal: false,
            logData: null,
            currentService: null,
        }));
    };

    // Handle refresh log
    const handleRefreshLog = () => {
        if (theState.currentService) {
            fetchServiceLog(theState.currentService.name);
        }
    };

    const columnTable = [
        {
            accessor: "index",
            title: "No",
            textAlign: "center",
            width: 60,
            render: (record, index) => index + 1,
        },
        {
            accessor: "name",
            title: "Name",
            sortable: true,
        },
        {
            accessor: "sub",
            title: "Status",
            sortable: true,
            render: (record) => (
                <Badge color={record.sub === "running" ? "green" : "red"}>
                    {record.sub}
                </Badge>
            ),
        },
        {
            accessor: "full_name",
            title: "Service Name",
            sortable: true,
        },
        {
            accessor: "actions",
            title: "Actions",
            textAlign: "center",
            width: 100,
            render: (record) => (
                <Group gap="xs" justify="center">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleOpenLogModal(record)} // ← Update ini
                        title="View Logs"
                    >
                        <IconReportSearch size={16} />
                    </ActionIcon>
                </Group>
            ),
        },
    ];

    return {
        columnTable,
        pageSize,
        setPageSize,
        PAGE_SIZES,
        record,
        isLoading,
        getList,
        openLogModal: theState.openLogModal, // ✅ Extract ini
        theState,
        handleCloseLogModal,
        handleRefreshLog,
    };
};

export default ServiceDataList;
