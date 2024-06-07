document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim())); // Remove quotes and trim

        console.log('Parsed CSV Rows:', rows); // Log parsed CSV rows

        // Specify the column names
        const columnsToDisplay = ['Subject Code', 'Subject Title', 'Grade'];

        if (rows.length > 0) {
            const headers = rows[0].map(header => header.trim()); // Trim whitespace from headers
            console.log('Headers:', headers); // Log headers

            const tableContainer = document.getElementById('tableContainer');
            let tableHTML = '<table><thead><tr>';

            // Add header row
            columnsToDisplay.forEach(column => {
                const columnIndex = headers.findIndex(header => header.toLowerCase() === column.toLowerCase());
                if (columnIndex !== -1) {
                    tableHTML += `<th>${headers[columnIndex]}</th>`;
                } else {
                    console.error(`Column "${column}" not found in the CSV file.`);
                }
            });
            tableHTML += '</tr></thead><tbody>';

            // Add data rows
            rows.slice(1).forEach(row => {
                tableHTML += '<tr>';
                columnsToDisplay.forEach(column => {
                    const columnIndex = headers.findIndex(header => header.toLowerCase() === column.toLowerCase());
                    if (columnIndex !== -1) {
                        tableHTML += `<td>${row[columnIndex]}</td>`;
                    } else {
                        tableHTML += '<td></td>';
                    }
                });
                tableHTML += '</tr>';
            });

            tableHTML += '</tbody></table>';
            tableContainer.innerHTML = tableHTML;

            // Show table and calculate GPA
            tableContainer.classList.remove('hidden');
            const gpaContainer = document.getElementById('gpaContainer');
            gpaContainer.innerHTML = `<p>GPA: ${calculateGPA(rows)}</p>`;
            gpaContainer.classList.remove('hidden');
        }
    };

    reader.readAsText(file);
});

function calculateGPA(rows) {
    const gradePoints = {
        'O': 10,
        'A+': 9,
        'A': 8,
        'B+': 7,
        'B': 6,
        'C': 5,
        'P': 4,
        'F': 0
    };

    const creditPoints = {
        'CY23111': 3, // Chemistry
        'CY23121': 1, // Chemistry Laboratory
        'GE23111': 3, // Problem Solving and C Programming
        'GE23112': 0, // Heritage of Tamil
        'GE23121': 1, // Problem Solving and C Programming Laboratory
        'GE23122': 1, // Engineering Practices Laboratory
        'GE23131': 4, // Engineering Graphics
        'HS23111': 2, // Communicative English
        'MA23111': 4, // Matrices and Calculus
        // Adjust credit points for other subjects as needed
    };

    let totalCredits = 0;
    let totalWeightedGradePoints = 0;

    // Loop through rows and calculate weighted grade points
    rows.slice(1).forEach(row => {
        const subjectCode = row[3].trim(); // Subject code is in the 4th column
        const grade = row[5].trim(); // Grade is in the 6th column
        if (subjectCode in creditPoints && grade in gradePoints) {
            const creditPoint = creditPoints[subjectCode];
            const gradePoint = gradePoints[grade];
            const weightedGradePoint = creditPoint * gradePoint;
            totalCredits += creditPoint; // Increment total credits
            totalWeightedGradePoints += weightedGradePoint; // Increment total weighted grade points
        } else {
            console.error(`Subject code "${subjectCode}" or grade "${grade}" not found in the creditPoints or gradePoints.`);
        }
    });

    if (totalCredits === 0) {
        return 'N/A';
    }

    const gpa = totalWeightedGradePoints / totalCredits;
    return gpa.toFixed(2); // Round GPA to 2 decimal places
}
