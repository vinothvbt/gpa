document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        const columnsToDisplay = ['Subject Code', 'Subject Title', 'Credits', 'Grade'];
        const headers = rows[0].map(header => header.trim());

        if (rows.length > 0) {
            const tableContainer = document.getElementById('tableContainer');
            tableContainer.classList.remove('hidden');

            let tableHTML = '<table><thead><tr>';

            columnsToDisplay.forEach(column => {
                const columnIndex = headers.findIndex(header => header.toLowerCase() === column.toLowerCase());
                if (columnIndex !== -1) {
                    tableHTML += `<th>${headers[columnIndex]}</th>`;
                } else {
                    console.error(`Column "${column}" not found in the CSV file.`);
                }
            });
            tableHTML += '</tr></thead><tbody>';

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

            const gpaResult = calculateGPA(rows);
            const gpaContainer = document.getElementById('gpaContainer');
            gpaContainer.classList.remove('hidden');
            gpaContainer.innerHTML = `
                <p>GPA: ${gpaResult.gpa}</p>
                <p>Total Credits: ${gpaResult.totalCredits}</p>
                <p>Total Weighted Grade Points: ${gpaResult.totalWeightedGradePoints}</p>
            `;

            const previousGPA = parseFloat(document.getElementById('previousGPA').value);
            if (!isNaN(previousGPA)) {
                const cgpa = calculateCGPA(previousGPA, parseFloat(gpaResult.gpa));
                gpaContainer.innerHTML += `<p>CGPA: ${cgpa}</p>`;
            }
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
        'C': 3,
        'P': 4,
        'F': 0
    };

    const creditColumn = 'Credits';
    const gradeColumn = 'Grade';
    const headers = rows[0];
    const creditIndex = headers.findIndex(header => header.toLowerCase() === creditColumn.toLowerCase());
    const gradeIndex = headers.findIndex(header => header.toLowerCase() === gradeColumn.toLowerCase());

    if (creditIndex === -1 || gradeIndex === -1) {
        console.error('Credit or Grade column not found in the CSV file.');
        return { gpa: 0, totalCredits: 0, totalWeightedGradePoints: 0 };
    }

    let totalCredits = 0;
    let totalWeightedGradePoints = 0;

    rows.slice(1).forEach(row => {
        const credits = parseFloat(row[creditIndex]);
        const grade = row[gradeIndex].toUpperCase();

        if (!isNaN(credits) && gradePoints.hasOwnProperty(grade)) {
            totalCredits += credits;
            totalWeightedGradePoints += credits * gradePoints[grade];
        }
    });

    const gpa = totalCredits > 0 ? totalWeightedGradePoints / totalCredits : 0;
    return { gpa: gpa.toFixed(2), totalCredits, totalWeightedGradePoints };
}

function calculateCGPA(previousGPA, currentGPA) {
    if (!isNaN(previousGPA) && !isNaN(currentGPA)) {
        return ((previousGPA + currentGPA) / 2).toFixed(2);
    } else {
        return 'N/A';
    }
}

document.getElementById('toggleInstructions').addEventListener('click', function() {
    const instructions = document.getElementById('instructions');
    if (instructions.classList.contains('hidden')) {
        instructions.classList.remove('hidden');
        this.textContent = 'Hide Instructions';
    } else {
        instructions.classList.add('hidden');
        this.textContent = 'Show Instructions';
    }
});
