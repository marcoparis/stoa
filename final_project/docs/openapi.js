const message = { type: 'object', properties: { message: { type: 'string' } } };
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ 'application/json': { schema } });
const msg = (description) => ({ description, content: json(ref('Message')) });

const isbnParam = { name: 'isbn', in: 'path', required: true, schema: { type: 'string' }, example: '1' };

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'Book Reviews API',
        version: '2.0.0',
        description:
            'REST API for an online bookshop: browse books, register, log in and manage your own reviews.\n\n' +
            '**How to try the protected endpoints here:** call `POST /register`, then `POST /customer/login`. ' +
            'The session cookie is set automatically, or copy the returned `token` into **Authorize** (Bearer).',
    },
    servers: [{ url: '/' }],
    tags: [
        { name: 'Books', description: 'Public catalog' },
        { name: 'Users', description: 'Registration and authentication' },
        { name: 'Reviews', description: 'Reviews (write operations require login)' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            sessionCookie: { type: 'apiKey', in: 'cookie', name: 'connect.sid' },
        },
        schemas: {
            Message: message,
            Book: {
                type: 'object',
                properties: {
                    author: { type: 'string', example: 'Jane Austen' },
                    title: { type: 'string', example: 'Pride and Prejudice' },
                    reviews: ref('Reviews'),
                },
            },
            BookWithIsbn: {
                allOf: [{ type: 'object', properties: { isbn: { type: 'string', example: '8' } } }, ref('Book')],
            },
            Reviews: {
                type: 'object',
                description: 'Map of username → review text',
                additionalProperties: { type: 'string' },
                example: { mario: 'Great book!' },
            },
            Credentials: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string', example: 'mario', pattern: '^[a-zA-Z0-9_.-]{3,30}$' },
                    password: { type: 'string', example: 'secret123', minLength: 6, maxLength: 72 },
                },
            },
        },
    },
    paths: {
        '/': {
            get: {
                tags: ['Books'],
                summary: 'List all books',
                responses: {
                    200: {
                        description: 'Books keyed by ISBN',
                        content: json({ type: 'object', additionalProperties: ref('Book') }),
                    },
                },
            },
        },
        '/isbn/{isbn}': {
            get: {
                tags: ['Books'],
                summary: 'Get a book by ISBN',
                parameters: [isbnParam],
                responses: { 200: { description: 'The book', content: json(ref('Book')) }, 404: msg('Book not found') },
            },
        },
        '/author/{author}': {
            get: {
                tags: ['Books'],
                summary: 'Search books by author (case-insensitive, partial match)',
                parameters: [{ name: 'author', in: 'path', required: true, schema: { type: 'string' }, example: 'austen' }],
                responses: {
                    200: { description: 'Matching books', content: json({ type: 'array', items: ref('BookWithIsbn') }) },
                    404: msg('No book found'),
                },
            },
        },
        '/title/{title}': {
            get: {
                tags: ['Books'],
                summary: 'Search books by title (case-insensitive, partial match)',
                parameters: [{ name: 'title', in: 'path', required: true, schema: { type: 'string' }, example: 'comedy' }],
                responses: {
                    200: { description: 'Matching books', content: json({ type: 'array', items: ref('BookWithIsbn') }) },
                    404: msg('No book found'),
                },
            },
        },
        '/review/{isbn}': {
            get: {
                tags: ['Reviews'],
                summary: 'Get the reviews of a book',
                parameters: [isbnParam],
                responses: { 200: { description: 'Reviews', content: json(ref('Reviews')) }, 404: msg('Book not found') },
            },
        },
        '/register': {
            post: {
                tags: ['Users'],
                summary: 'Register a new user',
                requestBody: { required: true, content: json(ref('Credentials')) },
                responses: {
                    201: msg('User registered'),
                    400: msg('Missing or invalid username/password'),
                    409: msg('Username already taken'),
                },
            },
        },
        '/customer/login': {
            post: {
                tags: ['Users'],
                summary: 'Log in: returns a JWT and sets a session cookie',
                requestBody: { required: true, content: json(ref('Credentials')) },
                responses: {
                    200: {
                        description: 'Logged in',
                        content: json({
                            type: 'object',
                            properties: { message: { type: 'string' }, token: { type: 'string' } },
                        }),
                    },
                    400: msg('Missing credentials'),
                    401: msg('Wrong username or password'),
                },
            },
        },
        '/customer/logout': {
            post: { tags: ['Users'], summary: 'Log out (destroys the session)', responses: { 200: msg('Logged out') } },
        },
        '/customer/auth/review/{isbn}': {
            put: {
                tags: ['Reviews'],
                summary: 'Add or update your review of a book',
                security: [{ bearerAuth: [] }, { sessionCookie: [] }],
                parameters: [
                    isbnParam,
                    {
                        name: 'review',
                        in: 'query',
                        required: false,
                        description: 'Review text (alternatively send JSON body `{ "review": "..." }`)',
                        schema: { type: 'string', maxLength: 1000 },
                        example: 'A timeless classic.',
                    },
                ],
                responses: {
                    200: msg('Review updated'),
                    201: msg('Review added'),
                    400: msg('Missing or too long review'),
                    401: msg('Not logged in'),
                    403: msg('Invalid or expired token'),
                    404: msg('Book not found'),
                },
            },
            delete: {
                tags: ['Reviews'],
                summary: 'Delete your review of a book',
                security: [{ bearerAuth: [] }, { sessionCookie: [] }],
                parameters: [isbnParam],
                responses: {
                    200: msg('Review deleted'),
                    401: msg('Not logged in'),
                    403: msg('Invalid or expired token'),
                    404: msg('Book not found or no review by this user'),
                },
            },
        },
    },
};
