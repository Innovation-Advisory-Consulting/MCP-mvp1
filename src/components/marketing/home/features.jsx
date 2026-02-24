import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";

import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";

export function Features() {
	return (
		<Box sx={{ pt: "120px" }}>
			<Stack spacing={8}>
				<Stack maxWidth="700px" sx={{ mx: "auto", px: 3 }}>
					<Stack spacing={2}>
						<Box sx={{ display: "flex", justifyContent: "center" }}>
							<Chip color="primary" icon={<StackIcon />} label="Enterprise Integration" variant="soft" />
						</Box>
						<Typography sx={{ textAlign: "center" }} variant="h3">
							Deploy Anywhere, Connect Everything
						</Typography>
						<Typography color="text.secondary" sx={{ textAlign: "center" }}>
							Mule CRM runs on Azure and AWS cloud infrastructure, with seamless integration to Microsoft Dataverse, Salesforce, SuiteCRM, and virtually any government database or legacy system.
						</Typography>
						<Box sx={{ display: "flex", justifyContent: "center" }}>
							<Button endIcon={<CaretRightIcon />} component={RouterLink} href={paths.contact} variant="contained">
								Schedule a Demo
							</Button>
						</Box>
					</Stack>
				</Stack>
				<Container maxWidth="md">
					<Box component="img" src="/assets/home-techs.svg" sx={{ display: "block", height: "auto", width: "100%" }} />
				</Container>
			</Stack>
		</Box>
	);
}
