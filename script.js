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

        const feedbackContainer = document.getElementById('feedback');
        feedbackContainer.classList.remove('hidden');
        feedbackContainer.innerHTML = 'CSV file loaded successfully. Parsing data...';

        setTimeout(() => { // Simulate parsing delay for better UX
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

                // Calculate GPA
                const gpaContainer = document.getElementById('gpaContainer');
                gpaContainer.classList.remove('hidden'); // Show the GPA container
                gpaContainer.innerHTML = `<p>GPA: ${calculateGPA(rows)}</p>`;

                // Calculate CGPA
                const previousGPA = parseFloat(document.getElementById('previousGPA').value);
                const currentGPA = parseFloat(calculateGPA(rows));
                if (!isNaN(previousGPA)) {
                    const cgpa = calculateCGPA(previousGPA, currentGPA);
                    const cgpaContainer = document.getElementById('cgpaContainer');
                    cgpaContainer.classList.remove('hidden'); // Show the CGPA container
                    cgpaContainer.innerHTML = `<p>CGPA: ${cgpa}</p>`;
                }
            }
        }, 1000); // 1 second delay for better UX
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

    let totalCredits = 0;
    let totalWeightedGradePoints = 0;

    // Loop through rows and calculate weighted grade points
    rows.slice(1).forEach(row => {
        const subjectCode = row[3].replace(/"/g, '').trim(); // Subject code is in the fourth column
        const grade = row[5].replace(/"/g, '').trim(); // Grade is in the sixth column
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

function calculateCGPA(previousGPA, currentGPA) {
    // Assuming equal weights for previous and current GPA for simplicity
    const cgpa = (previousGPA + currentGPA) / 2;
    return cgpa.toFixed(2); // Round CGPA to 2 decimal places
}
