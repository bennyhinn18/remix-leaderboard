# Events API Documentation

## Overview
The Events API allows users to fetch event data from the database with filtering and selection options. This API does not require authentication and dynamically determines the status of events based on their date and time.

## Base URL
`/api/events`

## HTTP Method
`GET`

## Query Parameters
| Parameter  | Type   | Description |
|------------|--------|-------------|
| `status`   | string | Filter events by status (`upcoming`, `completed`, `ongoing`). Defaults to all events. |
| `limit`    | number | Limit the number of results returned. Default is `10`. |
| `fields`   | string | Specify the fields to be returned, separated by commas. Default: `id,title,time,date,venue`. |

## Response Format
The response is a JSON array of event objects with the selected fields and dynamically assigned status.

### Example Request
```sh
GET /api/events?status=upcoming&limit=5&fields=id,title,date
```

### Example Response
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Tech Conference 2025",
    "date": "2025-03-15",
    "status": "upcoming"
  },
  {
    "id": "987e6543-b21a-45c9-d321-876543210000",
    "title": "AI Summit",
    "date": "2025-02-20",
    "status": "ongoing"
  }
]
```

## Error Handling
If an error occurs, the API returns a JSON response with an error message:

```json
{
  "error": "Failed to fetch events"
}
```

## Notes
- The `status` field is dynamically calculated based on the event's date and time.
- The default selection includes only `id`, `title`, `time`, `date`, and `venue`, but additional fields can be requested using the `fields` parameter.

---
This documentation provides details on how to use the API effectively. Let me know if you need any modifications! 🚀

