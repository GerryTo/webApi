import { Button, Group } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import TableData from "../../components/table-data";
import ServiceDataList from "./data/ServiceDataList";
import LogViewerModal from "./components/log";

const ServiceList = () => {
	const {
		columnTable,
		pageSize,
		setPageSize,
		PAGE_SIZES,
		record,
		isLoading,
		getList,
		openLogModal,
		theState,
		handleCloseLogModal,
		handleRefreshLog,
	} = ServiceDataList();

	console.log('✅ Records in ServiceList:', record);
	console.log('📊 Total records:', record?.length);

	return (
		<>
			<Group justify="space-between" p={10}>
				<Button leftSection={<IconRefresh />} onClick={getList}>
					Refresh
				</Button>
			</Group>
			
			<TableData
				record={record}
				column={columnTable}   
				pageSize={pageSize}
				setPageSize={setPageSize}
				PAGE_SIZES={PAGE_SIZES}
				isLoading={isLoading}
			/>
			{openLogModal && (
				<LogViewerModal
					opened={openLogModal}
					onClose={handleCloseLogModal}
					logData={theState.logData}
					loading={theState.logLoading}
					onRefresh={handleRefreshLog}
					currentService={theState.currentService}
				/>
			)}
		</>
	);
};

export default ServiceList;