"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import useEmblaCarousel from "embla-carousel-react";

const reviews = [
	{
		id: "REV-5",
		author: "Sarah Mitchell, Director of Community Services",
		comment:
			"Mule CRM transformed how our county manages grant applications. We've reduced processing time by 60% and citizens can now track their applications online 24/7. The mobile app for our field inspectors has been a game-changer.",
	},
	{
		id: "REV-4",
		author: "James Rodriguez, IT Director, Municipal Government",
		comment:
			"The integration with our existing Dataverse systems was seamless. FARO Software's team provided exceptional support during implementation. We're now processing three times more business licenses with the same staff.",
	},
	{
		id: "REV-3",
		author: "Dr. Amanda Chen, State Agency Administrator",
		comment:
			"The citizen portal has dramatically reduced call center volume. Citizens love being able to apply for permits online and check status anytime. Our satisfaction scores went from 3.2 to 4.8 out of 5 within six months.",
	},
	{
		id: "REV-2",
		author: "Michael Thompson, Emergency Management Coordinator",
		comment:
			"The mobile capabilities are outstanding. Our emergency response teams can coordinate in real-time, even in areas with limited connectivity. The offline mode has proven invaluable during disaster response operations.",
	},
	{
		id: "REV-1",
		author: "Patricia Williams, Regional Licensing Administrator",
		comment:
			"Mule CRM handles everything from professional licenses to building permits. The workflow automation and compliance reporting features have made our audit processes smooth and stress-free. Highly recommended for any government agency.",
	},
];

export function Testimonails() {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
	const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
	const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const [scrollSnaps, setScrollSnaps] = React.useState([]);

	const scrollPrev = React.useCallback(() => {
		emblaApi?.scrollPrev();
	}, [emblaApi]);

	const scrollNext = React.useCallback(() => {
		emblaApi?.scrollNext();
	}, [emblaApi]);

	const scrollTo = React.useCallback(
		(index) => {
			emblaApi?.scrollTo(index);
		},
		[emblaApi]
	);

	const onInit = React.useCallback((api) => {
		setScrollSnaps(api.scrollSnapList());
	}, []);

	const onSelect = React.useCallback((api) => {
		setSelectedIndex(api.selectedScrollSnap());
		setPrevBtnDisabled(!api.canScrollPrev());
		setNextBtnDisabled(!api.canScrollNext());
	}, []);

	React.useEffect(() => {
		if (!emblaApi) return;

		onInit(emblaApi);
		onSelect(emblaApi);
		emblaApi.on("reInit", onInit);
		emblaApi.on("reInit", onSelect);
		emblaApi.on("select", onSelect);
	}, [emblaApi, onInit, onSelect]);

	return (
		<Box
			sx={{
				bgcolor: "var(--mui-palette-background-level1)",
				borderTop: "1px solid var(--mui-palette-divider)",
				pt: "120px",
			}}
		>
			<Container maxWidth="md">
				<Stack spacing={8}>
					<Stack spacing={2}>
						<Box sx={{ display: "flex", justifyContent: "center" }}>
							<Chip color="primary" icon={<UsersIcon />} label="Success Stories" variant="soft" />
						</Box>
						<Typography sx={{ textAlign: "center" }} variant="h3">
							Trusted by Government Agencies
						</Typography>
					</Stack>
					<Stack spacing={3} sx={{ "--slide-spacing": "1rem", "--slide-size": "100%", "--slide-height": " 300px" }}>
						<Box ref={emblaRef} sx={{ overflow: "hidden" }}>
							<Box
								sx={{
									backfaceVisibility: "hidden",
									display: "flex",
									touchAction: "pan-y",
									ml: "calc(var(--slide-spacing) * -1)",
								}}
							>
								{reviews.map((review) => (
									<Stack
										key={review.id}
										spacing={2}
										sx={{
											flex: "0 0 var(--slide-size)",
											minWidth: 0,
											pl: "var(--slide-spacing)",
											position: "relative",
										}}
									>
										<Typography color="text.secondary" sx={{ textAlign: "center" }}>
											{review.comment}
										</Typography>
										<Typography sx={{ textAlign: "center" }}>{review.author}</Typography>
									</Stack>
								))}
							</Box>
						</Box>
						<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
							<IconButton disabled={prevBtnDisabled} onClick={scrollPrev}>
								<CaretLeftIcon />
							</IconButton>
							<Stack direction="row" spacing={1} sx={{ flex: "1 1 auto", justifyContent: "center" }}>
								{scrollSnaps.map((_, index) => (
									<Box
										key={index}
										onClick={() => {
											scrollTo(index);
										}}
										sx={{
											bgcolor:
												index === selectedIndex
													? "var(--mui-palette-primary-main)"
													: "var(--mui-palette-action-selected)",
											borderRadius: "50%",
											cursor: "pointer",
											height: "8px",
											mx: "0.25rem",
											width: "8px",
										}}
									/>
								))}
							</Stack>
							<IconButton disabled={nextBtnDisabled} onClick={scrollNext}>
								<CaretRightIcon />
							</IconButton>
						</Stack>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}
