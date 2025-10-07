import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/books - Get all books in the catalogue
export async function GET() {
  try {
    // Get the path to the books.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const data = JSON.parse(fileContents);

    // Return all books
    return NextResponse.json({
      books: data.books,
      total: data.books.length
    });

  } catch (error) {
    console.error('Error reading books data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Add a new book to the catalogue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'author', 'description', 'price', 'isbn', 'genre', 'datePublished', 'pages', 'language', 'publisher'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Get the path to the books.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const data = JSON.parse(fileContents);

    // Generate new ID (find highest existing ID and increment)
    const maxId = data.books.reduce((max: number, book: any) => {
      const bookId = parseInt(book.id);
      return bookId > max ? bookId : max;
    }, 0);
    const newId = (maxId + 1).toString();

    // Create new book with defaults for optional fields
    const newBook = {
      id: newId,
      title: body.title,
      author: body.author,
      description: body.description,
      price: parseFloat(body.price),
      image: body.image || "/images/default-book.jpg",
      isbn: body.isbn,
      genre: Array.isArray(body.genre) ? body.genre : [body.genre],
      tags: body.tags || [],
      datePublished: body.datePublished,
      pages: parseInt(body.pages),
      language: body.language,
      publisher: body.publisher,
      rating: body.rating || 0,
      reviewCount: body.reviewCount || 0,
      inStock: body.inStock !== undefined ? body.inStock : true,
      featured: body.featured !== undefined ? body.featured : false
    };

    // Add new book to the array
    data.books.push(newBook);

    // Write back to file
    await fs.writeFile(jsonDirectory + '/books.json', JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json(
      { 
        message: 'Book added successfully',
        book: newBook
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json(
      { error: 'Failed to add book' },
      { status: 500 }
    );
  }
}