# [JsonBase - Data Organizer](https://alessandroferrante.github.io/JsonBase-Data-Organizer)

## How JsonBase Works

JsonBase is a flexible data management system designed for handling tabular data with dynamic schema definitions. 
It enables users to create, modify, and organize registers consisting of configurable columns and records. 
Additionally, the system supports seamless import and export of data in JSON format.

## JSON File Structure

JsonBase relies on a structured JSON format to define registers. A valid JSON file should conform to the following schema:

```json
{
    "columns": {
        "names": ["column1", "column2", ...],
        "types": ["text", "number", ...]
    },
    "records": [
        {
            "column1": "value1",
            "column2": "value2",
            ...
        },
        ...
    ]
}
```

### Components of a Register

- **columns.names:** An ordered list of column identifiers.
- **columns.types:** A corresponding list specifying the data type of each column (e.g., `text`, `number`, `date`).
- **records:** An array of objects where each entry represents a structured data row, associating column names with their respective values.

### Best Practices

To ensure compatibility and optimal performance:
- Maintain consistency between `columns.names` and `records` key-value pairs.
- Choose appropriate data types for efficient querying and processing.
- Validate the structure before importing to avoid inconsistencies.

By adhering to this format, JsonBase ensures a robust and scalable approach to handling structured data.

## Usage
To use the project go to the page [JsonBase](https://alessandroferrante.github.io/JsonBase-Data-Organizer/)

## License
This project is licensed under the [License Name]. See the LICENSE file for more details.

## Contact
If you have any questions or feedback, please contact at *github@alessandroferrante.net*.