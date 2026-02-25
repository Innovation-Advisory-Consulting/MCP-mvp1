import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import { appConfig } from "@/config/app";
import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";
import { CustomerCreateForm } from "@/components/dashboard/customer/customer-create-form";

const metadata = { title: `Edit | Customers | Dashboard | ${appConfig.name}` };

export function Page() {
  const { customerId } = useParams();
  const [customer, setCustomer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        console.log('Fetching customer:', customerId);
        const response = await fetch(`${apiUrl}/customers/${customerId}`);
        const result = await response.json();
        console.log('Customer data:', result);
        setCustomer(result.data);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

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
          <Stack spacing={3}>
            <div>
              <Link
                color="text.primary"
                component={RouterLink}
                href={paths.dashboard.customers.list}
                sx={{ alignItems: "center", display: "inline-flex", gap: 1 }}
                variant="subtitle2"
              >
                <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
                Customers
              </Link>
            </div>
            <div>
              <Typography variant="h4">Edit Account</Typography>
            </div>
          </Stack>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <CustomerCreateForm customer={customer} />
          )}
        </Stack>
      </Box>
    </React.Fragment>
  );
}
