import * as z from 'zod';

export const NewGame = z.object({
    name: z.string().min(2).max(100).refine((value) => !/[^a-zA-Z0-9\s]/.test(value), {
        message: "Name can only contain letters, numbers, and spaces"
    }),
    description: z.string().max(255).optional()
});

export const newVersion = z.object({
    version_number: z.string().regex(/^v\d+\.\d+\.\d+$/, "Version number must be in the format vX.Y.Z")
});