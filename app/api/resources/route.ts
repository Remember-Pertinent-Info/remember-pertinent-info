
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const title: string | null = data.get('title') as string;
        const description: string | null = data.get('description') as string;
        const resourceType: string | null = data.get('resourceType') as string;
        const uploaderName: string | null = data.get('uploaderName') as string;
        const courseId: string | null = data.get('courseId') as string;


        if (!file || !title || !courseId) {
            return NextResponse.json({ error: "Missing required fields (file, title, courseId)." }, { status: 400 });
        }

        // Create a unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}-${file.name}`;
        
        // Define the path to save the file
        const courseUploadDir = path.join(process.cwd(), 'uploads', courseId);
        const filePath = path.join(courseUploadDir, filename);

        // Ensure the course-specific directory exists
        await mkdir(courseUploadDir, { recursive: true });

        // Write the file to the filesystem
        await writeFile(filePath, buffer);

        console.log(`Uploaded file saved at: ${filePath}`);

        // TODO: Insert metadata into the database

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully.",
            filePath: filePath, // Returning the path for now
            filename: filename,
            size: file.size,
            type: file.type,
            title,
            description,
            resourceType,
            uploaderName: uploaderName || 'Anonymous',
            courseId
        });

    } catch (error: unknown) {
        console.error('Error uploading file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
    }
}
