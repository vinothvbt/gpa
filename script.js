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

        const columnsToDisplay = ['Subject Code', 'Subject Title', 'Grade'];

        if (rows.length > 0) {
            const headers = rows[0].map(header => header.trim());

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

            tableHTML += '<th>Credits</th><th>Grade Points</th></tr></thead><tbody>';

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

                const creditPoint = creditPoints[subjectCode] || 'N/A';
                const gradePoint = gradePoints[grade] || 'N/A';
                tableHTML += `<td>${creditPoint}</td><td>${gradePoint}</td></tr>`;

                if (creditPoint !== 'N/A' && gradePoint !== 'N/A') {
                    calculations.push({
                        creditPoint,
                        gradePoint,
                        weightedGradePoint: creditPoint * gradePoint
                    });
                }
            });

            tableHTML += '</tbody></table>';
            tableContainer.innerHTML = tableHTML;

            const gpaContainer = document.getElementById('gpaContainer');
            gpaContainer.classList.remove('hidden');

            let gpaDetailsHTML = '<h3>GPA Calculation Details</h3>';
            gpaDetailsHTML += '<p>The formula for GPA calculation is:</p>';
            gpaDetailsHTML += '<p><strong>GPA = (Total Weighted Grade Points) / (Total Credits)</strong></p>';
            gpaDetailsHTML += '<ul class="calculation-list">';

            let totalCredits = 0;
            let totalWeightedGradePoints = 0;
            calculations.forEach(calc => {
                totalCredits += calc.creditPoint;
                totalWeightedGradePoints += calc.weightedGradePoint;
                gpaDetailsHTML += `<li>${calc.creditPoint} (Credits) x ${calc.gradePoint} (Grade Points) = ${calc.weightedGradePoint} (Weighted Grade Points)</li>`;
            });

            gpaDetailsHTML += '</ul>';

            const gpa = (totalCredits === 0) ? 'N/A' : (totalWeightedGradePoints / totalCredits).toFixed(2);
            gpaDetailsHTML += `<p>Total Credits: ${totalCredits}</p>`;
            gpaDetailsHTML += `<p>Total Weighted Grade Points: ${totalWeightedGradePoints}</p>`;
            gpaDetailsHTML += `<p>GPA: ${gpa}</p>`;

            gpaContainer.innerHTML = gpaDetailsHTML;

            const instructions = document.getElementById('instructions');
            instructions.classList.add('hidden');
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
    'CY23111': 3,
    'CY23121': 1,
    'GE23111': 3,
    'GE23112': 0,
    'GE23121': 1,
    'GE23122': 1,
    'GE23131': 4,
    'HS23111': 3,
    'MA23111': 4,
};
