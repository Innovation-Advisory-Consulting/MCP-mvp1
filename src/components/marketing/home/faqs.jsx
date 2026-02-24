"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { QuestionIcon } from "@phosphor-icons/react/dist/ssr/Question";

const faqs = [
	{
		id: "FAQ-1",
		question: "What security and compliance certifications does Mule CRM have?",
		answer:
			"Mule CRM is built with government security requirements in mind. We support deployment configurations that meet various compliance frameworks including FedRAMP, StateRAMP, and CJIS standards. Our platform includes role-based access control, audit logging, data encryption at rest and in transit, and supports single sign-on integration with government identity systems.",
	},
	{
		id: "FAQ-2",
		question: "Can Mule CRM integrate with our existing government systems?",
		answer:
			"Yes. Mule CRM is designed for enterprise integration and connects seamlessly with Microsoft Dataverse, Salesforce, SuiteCRM, and virtually any government database through standard APIs and web services. We support both cloud-based and on-premises systems, and our integration framework handles legacy systems commonly found in government environments.",
	},
	{
		id: "FAQ-3",
		question: "How does the mobile app work for field staff with limited connectivity?",
		answer:
			"Our mobile applications are designed for field operations and include robust offline capabilities. Field staff can capture data, photos, signatures, and complete forms without an internet connection. All data syncs automatically when connectivity is restored, ensuring no information is lost during inspections, enforcement actions, or emergency response activities.",
	},
	{
		id: "FAQ-4",
		question: "What is the typical implementation timeline for a government agency?",
		answer:
			"Implementation timelines vary based on agency size and complexity, but most deployments follow a 3-6 month process including requirements gathering, system configuration, data migration, integration setup, staff training, and phased rollout. We work closely with your IT team and provide dedicated project management to ensure smooth deployment with minimal disruption to operations.",
	},
	{
		id: "FAQ-5",
		question: "Is the citizen portal accessible and compliant with government standards?",
		answer:
			"Yes. The citizen self-service portal is designed to meet Section 508 and WCAG 2.1 AA accessibility standards. It includes features like screen reader support, keyboard navigation, high contrast modes, and mobile responsiveness. The portal supports multiple languages and can be customized to match your agency's branding while maintaining accessibility compliance.",
	},
	{
		id: "FAQ-6",
		question: "Can Mule CRM scale for different agency sizes?",
		answer:
			"Absolutely. Mule CRM is architected to scale from small municipal departments with a handful of users to large state agencies with thousands of staff members and hundreds of thousands of constituents. Our cloud deployment on Azure and AWS provides elastic scalability, and our licensing model is flexible to accommodate agencies of all sizes.",
	},
	{
		id: "FAQ-7",
		question: "What kind of training and support does FARO Software provide?",
		answer:
			"FARO Software provides comprehensive training programs including administrator training, end-user training, and train-the-trainer sessions. We offer online documentation, video tutorials, and ongoing technical support. Our customer success team provides regular check-ins and is available to help your agency maximize the platform's value over time.",
	},
];

export function Faqs() {
	return (
		<Box sx={{ bgcolor: "var(--mui-palette-background-level1)", py: "120px" }}>
			<Container maxWidth="md">
				<Stack spacing={8}>
					<Stack maxWidth="700px" sx={{ mx: "auto" }}>
						<Stack spacing={2}>
							<Box sx={{ display: "flex", justifyContent: "center" }}>
								<Chip color="primary" icon={<QuestionIcon />} label="FAQ" variant="soft" />
							</Box>
							<Typography sx={{ textAlign: "center" }} variant="h3">
								Frequently Asked Questions
							</Typography>
							<Typography color="text.secondary" sx={{ textAlign: "center" }}>
								Have additional questions about Mule CRM? Contact our government solutions team by{" "}
								<Box
									component="a"
									href="mailto:info@farosoftware.com"
									sx={{ color: "inherit", textDecoration: "underline" }}
								>
									email
								</Box>{" "}
								or schedule a consultation call.
							</Typography>
						</Stack>
					</Stack>
					<Stack spacing={2}>
						{faqs.map((faq) => (
							<Faq key={faq.id} {...faq} />
						))}
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}

function Faq({ answer, question }) {
	const [isExpanded, setIsExpanded] = React.useState(false);

	return (
		<Card sx={{ p: 3 }}>
			<Stack
				onClick={() => {
					setIsExpanded((prevState) => !prevState);
				}}
				sx={{ cursor: "pointer" }}
			>
				<Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
					<Typography variant="subtitle1">{question}</Typography>
					{isExpanded ? <CaretDownIcon /> : <CaretRightIcon />}
				</Stack>
				<Collapse in={isExpanded}>
					<Typography color="text.secondary" sx={{ pt: 3 }} variant="body2">
						{answer}
					</Typography>
				</Collapse>
			</Stack>
		</Card>
	);
}
