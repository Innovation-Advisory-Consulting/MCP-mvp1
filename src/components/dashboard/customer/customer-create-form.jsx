import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z as zod } from "zod";

import { paths } from "@/paths";
import { toast } from "@/components/core/toaster";

const schema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email").optional().or(zod.literal("")),
  phone: zod.string().optional(),
});

export function CustomerCreateForm({ customer }) {
  const navigate = useNavigate();
  const isEdit = !!customer;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    console.log('Customer prop changed:', customer);
    if (customer) {
      console.log('Resetting form with:', {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
      reset({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const url = isEdit
        ? `${apiUrl}/customers/${customer.id}`
        : `${apiUrl}/customers`;
      
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        throw new Error(error.message || "Failed to save customer");
      }

      toast.success(isEdit ? "Customer updated" : "Customer created");
      navigate(paths.dashboard.customers.list);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <FormControl error={Boolean(errors.name)} fullWidth>
                  <InputLabel required>Account Name</InputLabel>
                  <OutlinedInput {...field} />
                  {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)} fullWidth>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput {...field} type="email" />
                  {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Phone</InputLabel>
                  <OutlinedInput {...field} />
                </FormControl>
              )}
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button color="secondary" onClick={() => navigate(paths.dashboard.customers.list)}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
