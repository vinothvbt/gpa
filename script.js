document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }

    // Check the file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        console.log('Parsed CSV Rows:', rows); // Log parsed CSV rows

        // Specify the column names
        const columnsToDisplay = ['Subject Code', 'Subject Title', 'Grade'];

        if (rows.length > 0) {
            const headers = rows[0].map(header => header.trim()); // Trim whitespace from headers
            console.log('Headers:', headers); // Log headers

            const tableContainer = document.getElementById('tableContainer');
            tableContainer.classList.remove('hidden'); // Show the table container

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

            // Add additional columns for credits and grade points
            tableHTML += '<th>Credits</th><th>Grade Points</th></tr></thead><tbody>';

            // Add data rows
            const calculations = [];
            rows.slice(1).forEach(row => {
                tableHTML += '<tr>';
                let subjectCode = '';
                let grade = '';
                columnsToDisplay.forEach(column => {
                    const columnIndex = headers.findIndex(header => header.toLowerCase() === column.toLowerCase());
                    if (columnIndex !== -1) {
                        const cellData = row[columnIndex];
                        tableHTML += `<td>${cellData}</td>`;
                        if (column === 'Subject Code') subjectCode = cellData;
                        if (column === 'Grade') grade = cellData;
                    } else {
                        tableHTML += '<td></td>';
                    }
                });

                // Add credits and grade points
                const creditPoint = creditPoints[subjectCode] || 'N/A';
                const gradePoint = gradePoints[grade] || 'N/A';
                tableHTML += `<td>${creditPoint}</td><td>${gradePoint}</td></tr>`;

                if (creditPoint !== 'N/A' && gradePoint !== 'N/A') {
                    calculations.push({
                        subjectCode,
                        creditPoint,
                        gradePoint,
                        weightedGradePoint: creditPoint * gradePoint
                    });
                }
            });

            tableHTML += '</tbody></table>';
            tableContainer.innerHTML = tableHTML;

            // Show GPA calculation breakdown
            const gpaContainer = document.getElementById('gpaContainer');
            gpaContainer.classList.remove('hidden'); // Show the GPA container

            let gpaDetailsHTML = '<h3>GPA Calculation Details</h3>';
            gpaDetailsHTML += '<ul>';
            let totalCredits = 0;
            let totalWeightedGradePoints = 0;
            calculations.forEach(calc => {
                totalCredits += calc.creditPoint;
                totalWeightedGradePoints += calc.weightedGradePoint;
                gpaDetailsHTML += `<li>Subject Code: ${calc.subjectCode}, Credit Points: ${calc.creditPoint}, Grade Points: ${calc.gradePoint}, Weighted Grade Points: ${calc.weightedGradePoint}</li>`;
            });
            gpaDetailsHTML += '</ul>';

            const gpa = (totalCredits === 0) ? 'N/A' : (totalWeightedGradePoints / totalCredits).toFixed(2);
            gpaDetailsHTML += `<p>Total Credits: ${totalCredits}</p>`;
            gpaDetailsHTML += `<p>Total Weighted Grade Points: ${totalWeightedGradePoints}</p>`;
            gpaDetailsHTML += `<p>GPA: ${gpa}</p>`;

            gpaContainer.innerHTML = gpaDetailsHTML;

            // Hide the instructions
            document.getElementById('instructions').classList.add('hidden');
        }
    };

    reader.readAsText(file);
});

const gradePoints = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 3,
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
    'HS23111': 3, // Communicative English
    'MA23111': 4, // Matrices and Calculus
};
