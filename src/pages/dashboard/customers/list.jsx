import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";

import { appConfig } from "@/config/app";
import { dayjs } from "@/lib/dayjs";
import { paths } from "@/paths";
import { CustomersFilters } from "@/components/dashboard/customer/customers-filters";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { CustomersSelectionProvider } from "@/components/dashboard/customer/customers-selection-context";
import { CustomersTable } from "@/components/dashboard/customer/customers-table";

const metadata = { title: `List | Customers | Dashboard | ${appConfig.name}` };

const customers = [
	{
		id: "USR-010",
		name: "Sarah Johnson",
		avatar: "/assets/avatar-10.png",
		email: "sarah.johnson@domain.com",
		phone: "(555) 123-4567",
		quota: 75,
		status: "active",
		createdAt: dayjs().subtract(30, "minute").toDate(),
	},
	{
		id: "USR-009",
		name: "Michael Chen",
		avatar: "/assets/avatar-9.png",
		email: "michael.chen@domain.com",
		phone: "(555) 234-5678",
		quota: 150,
		status: "active",
		createdAt: dayjs().subtract(2, "hour").toDate(),
	},
	{
		id: "USR-008",
		name: "Emma Rodriguez",
		avatar: "/assets/avatar-8.png",
		email: "emma.rodriguez@domain.com",
		phone: "(555) 345-6789",
		quota: 200,
		status: "active",
		createdAt: dayjs().subtract(5, "hour").toDate(),
	},
	{
		id: "USR-007",
		name: "James Wilson",
		avatar: "/assets/avatar-7.png",
		email: "james.wilson@domain.com",
		phone: "(555) 456-7890",
		quota: 25,
		status: "pending",
		createdAt: dayjs().subtract(8, "hour").toDate(),
	},
	{
		id: "USR-006",
		name: "Olivia Martinez",
		avatar: "/assets/avatar-6.png",
		email: "olivia.martinez@domain.com",
		phone: "(555) 567-8901",
		quota: 0,
		status: "blocked",
		createdAt: dayjs().subtract(12, "hour").toDate(),
	},
	{
		id: "USR-005",
		name: "Fran Perez",
		avatar: "/assets/avatar-5.png",
		email: "fran.perez@domain.com",
		phone: "(815) 704-0045",
		quota: 50,
		status: "active",
		createdAt: dayjs().subtract(1, "day").toDate(),
	},
	{
		id: "USR-004",
		name: "Penjani Inyene",
		avatar: "/assets/avatar-4.png",
		email: "penjani.inyene@domain.com",
		phone: "(803) 937-8925",
		quota: 100,
		status: "active",
		createdAt: dayjs().subtract(1, "day").subtract(6, "hour").toDate(),
	},
	{
		id: "USR-003",
		name: "Carson Darrin",
		avatar: "/assets/avatar-3.png",
		email: "carson.darrin@domain.com",
		phone: "(715) 278-5041",
		quota: 10,
		status: "blocked",
		createdAt: dayjs().subtract(2, "day").toDate(),
	},
	{
		id: "USR-002",
		name: "Siegbert Gottfried",
		avatar: "/assets/avatar-2.png",
		email: "siegbert.gottfried@domain.com",
		phone: "(603) 766-0431",
		quota: 0,
		status: "pending",
		createdAt: dayjs().subtract(2, "day").subtract(12, "hour").toDate(),
	},
	{
		id: "USR-001",
		name: "Miron Vitold",
		avatar: "/assets/avatar-1.png",
		email: "miron.vitold@domain.com",
		phone: "(425) 434-5535",
		quota: 50,
		status: "active",
		createdAt: dayjs().subtract(3, "day").toDate(),
	},
];

export function Page() {
	const navigate = useNavigate();
	const { email, phone, sortDir, status } = useExtractSearchParams();

	const sortedCustomers = applySort(customers, sortDir);
	const filteredCustomers = applyFilters(sortedCustomers, { email, phone, status });

	const handleAddCustomer = () => {
		navigate(paths.dashboard.customers.create);
	};

	return (
		<React.Fragment>
			<Helmet>
				<title>{metadata.title}</title>
			</Helmet>
			<Box
				sx={{
					maxWidth: "var(--Content-maxWidth)",
					m: "var(--Content-margin)",
					p: "var(--Content-padding)",
					width: "var(--Content-width)",
				}}
			>
				<Stack spacing={4}>
					<Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>
						<Box sx={{ flex: "1 1 auto" }}>
							<Typography variant="h4">Customers</Typography>
						</Box>
						<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
							<Button startIcon={<PlusIcon />} variant="contained" onClick={handleAddCustomer}>
								Add
							</Button>
						</Box>
					</Stack>
					<CustomersSelectionProvider customers={filteredCustomers}>
						<Card>
							<CustomersFilters filters={{ email, phone, status }} sortDir={sortDir} />
							<Divider />
							<Box sx={{ overflowX: "auto" }}>
								<CustomersTable rows={filteredCustomers} />
							</Box>
							<Divider />
							<CustomersPagination count={filteredCustomers.length} page={0} />
						</Card>
					</CustomersSelectionProvider>
				</Stack>
			</Box>
		</React.Fragment>
	);
}

function useExtractSearchParams() {
	const [searchParams] = useSearchParams();

	return {
		email: searchParams.get("email") || undefined,
		phone: searchParams.get("phone") || undefined,
		sortDir: searchParams.get("sortDir") || undefined,
		status: searchParams.get("status") || undefined,
	};
}

// Sorting and filtering has to be done on the server.

function applySort(row, sortDir) {
	return row.sort((a, b) => {
		if (sortDir === "asc") {
			return a.createdAt.getTime() - b.createdAt.getTime();
		}

		return b.createdAt.getTime() - a.createdAt.getTime();
	});
}

function applyFilters(row, { email, phone, status }) {
	return row.filter((item) => {
		if (email && !item.email?.toLowerCase().includes(email.toLowerCase())) {
			return false;
		}

		if (phone && !item.phone?.toLowerCase().includes(phone.toLowerCase())) {
			return false;
		}

		if (status && item.status !== status) {
			return false;
		}

		return true;
	});
}
