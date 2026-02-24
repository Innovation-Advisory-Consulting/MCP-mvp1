import { paths } from "@/paths";

export const dashboardConfig = {
	layout: "vertical",
	navColor: "evident",
	navItems: [
		{
			key: "general",
			title: "Customer Management",
			items: [
				{
					key: "customers",
					title: "Customers",
					icon: "users",
					items: [
						{ key: "customers", title: "List customers", href: paths.dashboard.customers.list },
						{ key: "customers:create", title: "Create customer", href: paths.dashboard.customers.create },
					],
				},
			],
		},
	],
};
