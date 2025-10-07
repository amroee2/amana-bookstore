import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/books/[id]/reviews - Get all reviews for a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the path to the data files
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    
    // Read both books and reviews data
    const booksFileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const reviewsFileContents = await fs.readFile(jsonDirectory + '/reviews.json', 'utf8');
    
    const booksData = JSON.parse(booksFileContents);
    const reviewsData = JSON.parse(reviewsFileContents);

    // Check if the book exists
    const book = booksData.books.find((book: any) => book.id === id);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Filter reviews for the specific book ID
    const bookReviews = reviewsData.reviews.filter((review: any) => review.bookId === id);

    return NextResponse.json({
      bookId: id,
      bookTitle: book.title,
      reviews: bookReviews,
      total: bookReviews.length
    });

  } catch (error) {
    console.error('Error fetching book reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book reviews' },
      { status: 500 }
    );
  }
}