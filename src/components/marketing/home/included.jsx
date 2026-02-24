import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LightningIcon } from "@phosphor-icons/react/dist/ssr/Lightning";

import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";

export function Included() {
	return (
		<Box
			sx={{
				bgcolor: "var(--mui-palette-neutral-950)",
				color: "var(--mui-palette-common-white)",
				overflow: "hidden",
				py: "120px",
				position: "relative",
			}}
		>
			<Box
				sx={{
					alignItems: "center",
					display: "flex",
					height: "100%",
					justifyContent: "center",
					left: 0,
					position: "absolute",
					top: 0,
					width: "100%",
					zIndex: 0,
				}}
			>
				<Box component="img" src="/assets/home-cosmic.svg" sx={{ height: "auto", width: "1600px" }} />
			</Box>
			<Stack spacing={8} sx={{ position: "relative", zIndex: 1 }}>
				<Container maxWidth="md">
					<Stack spacing={2}>
						<Typography color="inherit" sx={{ textAlign: "center" }} variant="h3">
							Three Platforms, One Solution
						</Typography>
						<Typography color="neutral.300" sx={{ textAlign: "center" }}>
							Seamlessly connect citizen services, back-office operations, and field staff with a unified government CRM platform
						</Typography>
					</Stack>
				</Container>
				<Container maxWidth="lg">
					<Grid alignItems="center" container spacing={3}>
						<Grid
							size={{
								md: 4,
								xs: 12,
							}}
						>
							<Stack spacing={2}>
								<div>
									<Chip color="success" icon={<LightningIcon />} label="Back Office System" variant="soft" />
								</div>
								<Typography color="inherit" variant="h3">
									Comprehensive Case Management
								</Typography>
								<Typography color="inherit">
									Powerful back-office tools for government staff to manage cases, process applications, coordinate across departments, handle document workflows, and maintain detailed constituent records with full audit trails.
								</Typography>
								<div>
									<Button color="secondary" component={RouterLink} href={paths.dashboard.overview} variant="contained">
										View Demo
									</Button>
								</div>
							</Stack>
						</Grid>
						<Grid
							size={{
								md: 8,
								xs: 12,
							}}
						>
							<Box sx={{ margin: "0 auto", maxWidth: "100%", position: "relative", width: "100%" }}>
								<Box
									sx={{
										bgcolor: "#8057f4",
										bottom: 0,
										filter: "blur(50px)",
										height: "20px",
										left: "15%",
										position: "absolute",
										right: 0,
										top: 0,
										transform: "rotate(-169deg)",
										zIndex: 0,
									}}
								/>
								<Box
									alt="Case Management"
									component="img"
									src="/assets/paperwork.jpg"
									sx={{
										borderRadius: "12px",
										height: "auto",
										objectFit: "cover",
										position: "relative",
										width: "100%",
										zIndex: 1
									}}
								/>
							</Box>
						</Grid>
					</Grid>
				</Container>
			</Stack>
		</Box>
	);
}
