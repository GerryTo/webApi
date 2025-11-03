import { DataTable } from "mantine-datatable";
import React, { useEffect, useState } from "react";
const TableData = ({
    record = [],
    column,
    pageSize,
    setPageSize,
    PAGE_SIZES,
    isLoading,
}) => {
    const [page, setPage] = useState(1);
    const [records, setRecords] = useState(record.slice(0, pageSize));
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(record?.slice(from, to));
    }, [page, pageSize, record]);
    return (
        <DataTable
            idAccessor="name"
            fetching={isLoading}
            withTableBorder
            borderRadius="sm"
            withColumnBorders
            striped
            highlightOnHover
            minHeight={150}
            records={records}
            columns={column}
            totalRecords={record?.length}
            paginationActiveBackgroundColor="grape"
            recordsPerPage={pageSize}
            page={page}
            onPageChange={(p) => setPage(p)}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
        />
    );
};

export default TableData;
