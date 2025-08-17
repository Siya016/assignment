// Simple PDF text extraction using fetch and text parsing
// This approach avoids compatibility issues with pdf-parse in serverless environments

// Function to chunk text into smaller pieces
function chunkText(text: string, maxChunkSize: number = 600000): string[] {
    const chunks: string[] = [];
    
    // If text is already small enough, return it as a single chunk
    if (text.length <= maxChunkSize) {
        return [text];
    }
    
    // Split by paragraphs first (double newlines)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        const paragraphWithBreaks = paragraph.trim() + '\n\n';
        
        // If adding this paragraph would exceed the chunk size, save current chunk and start new one
        if (currentChunk.length + paragraphWithBreaks.length > maxChunkSize) {
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = paragraphWithBreaks;
        } else {
            currentChunk += paragraphWithBreaks;
        }
    }
    
    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    // If we still have chunks that are too long, split them further by sentences
    const finalChunks: string[] = [];
    for (const chunk of chunks) {
        if (chunk.length <= maxChunkSize) {
            finalChunks.push(chunk);
        } else {
            // Split this chunk by sentences
            const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 0);
            let sentenceChunk = '';
            
            for (const sentence of sentences) {
                const sentenceWithPunctuation = sentence.trim() + '. ';
                
                if (sentenceChunk.length + sentenceWithPunctuation.length > maxChunkSize) {
                    if (sentenceChunk.trim().length > 0) {
                        finalChunks.push(sentenceChunk.trim());
                    }
                    sentenceChunk = sentenceWithPunctuation;
                } else {
                    sentenceChunk += sentenceWithPunctuation;
                }
            }
            
            if (sentenceChunk.trim().length > 0) {
                finalChunks.push(sentenceChunk.trim());
            }
        }
    }
    
    return finalChunks;
}

export async function fetchAndExtractPdfText(fileUrl: string) {
    try {
        console.log("Attempting to fetch PDF from:", fileUrl);
        
        // Fetch the PDF from the URL with proper headers
        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        
        // Check if the response is actually a PDF
        const contentType = response.headers.get('content-type');
        console.log("Response content type:", contentType);
        
        if (!contentType || !contentType.includes('application/pdf')) {
            console.warn("Warning: Response doesn't appear to be a PDF. Content-Type:", contentType);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log("PDF downloaded, size:", arrayBuffer.byteLength, "bytes");
        
        if (arrayBuffer.byteLength === 0) {
            throw new Error("Downloaded PDF is empty");
        }
        
        // For now, let's try to extract text using a different approach
        // Since pdf-parse has compatibility issues, let's use a simpler method
        
        // Convert to text using the response text method first
        const textResponse = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain,application/pdf',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (textResponse.ok) {
            const text = await textResponse.text();
            if (text && text.trim().length > 0) {
                console.log("Text extracted successfully, length:", text.length);
                
                // Chunk the text if it's too long
                const chunks = chunkText(text);
                console.log(`Text chunked into ${chunks.length} chunks`);
                
                // Return all chunks for processing
                return chunks;
            }
        }
        
        // If text extraction failed, throw an error
        throw new Error("Unable to extract text from PDF. The file might be image-only, corrupted, or in an unsupported format.");
        
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
