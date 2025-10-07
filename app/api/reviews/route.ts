import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/reviews - Get all reviews
export async function GET() {
  try {
    // Get the path to the reviews.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/reviews.json', 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json({
      reviews: data.reviews,
      total: data.reviews.length
    });

  } catch (error) {
    console.error('Error reading reviews data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Add a new review to the catalogue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['bookId', 'author', 'rating', 'title', 'comment'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    const rating = parseFloat(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if the book exists
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const booksFileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const booksData = JSON.parse(booksFileContents);
    
    const book = booksData.books.find((book: any) => book.id === body.bookId);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Read reviews data
    const reviewsFileContents = await fs.readFile(jsonDirectory + '/reviews.json', 'utf8');
    const reviewsData = JSON.parse(reviewsFileContents);

    // Generate new review ID
    const maxId = reviewsData.reviews.reduce((max: number, review: any) => {
      const reviewIdNum = parseInt(review.id.replace('review-', ''));
      return reviewIdNum > max ? reviewIdNum : max;
    }, 0);
    const newId = `review-${maxId + 1}`;

    // Create new review
    const newReview = {
      id: newId,
      bookId: body.bookId,
      author: body.author,
      rating: rating,
      title: body.title,
      comment: body.comment,
      timestamp: new Date().toISOString(),
      verified: body.verified !== undefined ? body.verified : false
    };

    // Add new review to the array
    reviewsData.reviews.push(newReview);

    // Write back to file
    await fs.writeFile(jsonDirectory + '/reviews.json', JSON.stringify(reviewsData, null, 2), 'utf8');

    // Update book's review count and rating (optional - you might want to recalculate)
    // This is a simple increment - in a real app you'd recalculate the average rating
    book.reviewCount += 1;
    await fs.writeFile(jsonDirectory + '/books.json', JSON.stringify(booksData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        message: 'Review added successfully',
        review: newReview
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}