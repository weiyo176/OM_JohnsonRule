//schedule = ["Start Time", "End Time", "Machine", "Job Name"]
function plotGanttChart(n, m, schedule, id, JobNum,jsonData) {
    var makespan = document.getElementById('makespan');
    makespan.innerHTML = "Makespan: " + schedule[schedule.length - 1][1].toString() ;
    // 假設你的圖表存儲在一個名為 myChart 的變量中
    if (window.myChart != null) {
        window.myChart.destroy();
    }

    let ctx = document.getElementById(id).getContext('2d');
    
    let machineName = [];
    for (let i = 1; i <= n; i++) {
        // machineName.push("Machine " + i.toString());
        machineName.push(jsonData[0][i]); // 機器名字
    };
    // 將排程轉換成 Chart.js 所需的格式
    let datasets = [];
    let currentMachine = null;
    let currentData = [];
    let currentBackgroundColor = [];
    let labels = [];
    let temp = [];
    
    //schedule = ["Start Time", "End Time", "Machine", "Job Name"]
    schedule.forEach((job, index) => {
        temp.push([job[0], job[1]]);
        //put job start time and End time into labels
        if (index % n == n - 1) {
            labels.push(temp);
            temp = [];
        }
    });
    // console.log("labels", labels);
    // console.log(labels);
    
    for (let i = 0; i < m; i++) {
        RandonColor = `hsl(${i / (m/2) * 180}, 100%, 75%)`;
        datasets.push({
            label: `job ${jsonData[JobNum[i]][[0]]}`,
            // label: jsonData[i+1][0],
            data: labels[i],
            backgroundColor: RandonColor,
            borderColor: RandonColor,
            borderWidth: 1,
            borderSkipped: 'false'
        });
    }


    const data = {
        //schedule = ["Start Time", "End Time", "Machine", "Job Name"]
        labels: machineName,
        datasets: datasets
    };
    const config = {
        type: 'bar',
        data,
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
            // 懸浮不顯示提示
            ,
            plugins: {
                title: {
                    display: true,
                    text: 'Johnson\'s Rule with ' + n.toString() + ' machines and ' + m.toString() + ' jobs'
                },
                tooltip: {
                    enabled: true
                },
                datalabels: {
                    formatter: function (value, context) {
                        // console.log(context)
                        // console.log(value)
                        return value[1] - value[0];
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    };
    window.myChart = new Chart(ctx, config);
    // new Chart(ctx, config);
}

function johnsonRule2(jobs) {
    // 有幾個工作
    let n = jobs.length;
    // 保存原本的工作排序
    // let jobb = [...jobs];
    let jobb = JSON.parse(JSON.stringify(jobs));
    // let jobb = Array.from(jobs);
    // 排序工作由小到大
    jobs.sort((a, b) => Math.min(a[0], a[1]) - Math.min(b[0], b[1]));
    // console.log("jobb:",jobb);
    // console.log("jobs:",jobs);
    let schedule_job1 = [];  // Front
    let schedule_job2 = [];  // Back
    let machine1_jobs = jobs.map(job => job[0]);
    let machine2_jobs = jobs.map(job => job[1]);

    for (let i = 0; i < n; i++) {
        // 排序好的工作去找原始的索引值
        let index = jobb.findIndex(job => job[0] === jobs[i][0] && job[1] === jobs[i][1]) +1;
        // console.log("index:",index-1,"jobb[index]:",jobb[index-1]);
        jobb[index-1][0] = -1;
        jobb[index-1][1] = -1;
        // 判斷工作要放前面還後面(機器一比較小，放在前)
        if (machine1_jobs[i] < machine2_jobs[i]) {
            schedule_job1.push(index);
        } else {
            schedule_job2.unshift(index);
        }
    }
    // 前+後就是最佳化排序
    return schedule_job1.concat(schedule_job2);
}

// JavaScript 版本的 Johnson's Rule
function johnsonRule3(jobs) {
    let n = jobs.length;
    // let jobb = [...jobs];
    let jobb = JSON.parse(JSON.stringify(jobs));
    // console.log("jobb:",jobb);
    jobs.sort((a, b) => Math.min(a[0] + a[1], a[1] + a[2]) - Math.min(b[0] + b[1], b[1] + b[2]));

    let schedule_job1 = [];  // Front
    let schedule_job2 = [];  // Back
    let machine1_jobs = jobs.map(job => job[0] + job[1]);
    let machine2_jobs = jobs.map(job => job[1] + job[2]);

    for (let i = 0; i < n; i++) {
        let index = jobb.findIndex(job => job[0] === jobs[i][0] && job[1] === jobs[i][1] && job[2] === jobs[i][2]) +1;
        // console.log("index:",index-1,"jobb[index]:",jobb[index-1]);
        jobb[index-1][0] = -1;
        jobb[index-1][1] = -1;
        if (machine1_jobs[i] < machine2_jobs[i]) {
            schedule_job1.push(index);
        } else {
            schedule_job2.unshift(index);
        }
    }
    return schedule_job1.concat(schedule_job2);
}

// when choose excel file, the name of file will appear 
function displayFileName(input) {
    var fileName = input.files[0].name;
    document.getElementById('selectedFileName').innerText = fileName;
}

function selectFile() {
    // 點擊 "Select an Excel file" 按鈕時觸發文件輸入元素的點擊事件
    document.getElementById('excelFileInput').click();
}

// Ensure that SheetJS library is included before this script
function readExcel() {

    // Get the input element
    var input = document.getElementById('excelFileInput');

    // Check if a file is selected
    if (!input.files || input.files.length === 0) {
        alert('Please select an Excel file.');
        return;
    }

    // Get the file
    var file = input.files[0];

    // Create a new FileReader
    var reader = new FileReader();

    // Set up the FileReader to read the Excel file
    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });

        // Assuming there is only one sheet in the Excel file
        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON
        var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Display the JSON data
        var excelDataDiv = document.getElementById('excelData');
        excelDataDiv.innerHTML = '<pre>' + JSON.stringify(jsonData, null, 2) + '</pre>';
        displayExcelData(jsonData); // 轉成 table 並輸出
        
        // Remove the g1.gif from the canvas
        removeCanvasImage();
    };

    // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
}

// Function to remove the image from the canvas
function removeCanvasImage() {
    // Get the canvas and image elements
    var canvas = document.getElementById('myChart1');
    var img = document.querySelector('.chartBox img');

    // Check if the canvas and image elements exist
    if (canvas && img) {
        // Get the canvas context
        var ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Remove the image element
        img.remove();
    }
}


function displayExcelData(jsonData) {
    // Get the div where the table will be displayed
    var excelDataDiv = document.getElementById('excelData');

    // Create a table element
    var table = document.createElement('table');

    // Create data rows
    for (var i = 0; i < jsonData.length; i++) {
        var dataRow = table.insertRow(i);
        for (var j in jsonData[i]) {
            var td = dataRow.insertCell();
            td.innerHTML = jsonData[i][j];
        }
    }

    // Clear previous content and append the table
    excelDataDiv.innerHTML = '';
    excelDataDiv.appendChild(table);

    // 判斷是two 還是 three machine
    if (jsonData[0].length - 1 == 2) {
        twoMachine(jsonData);
    }
    if (jsonData[0].length - 1 == 3){
        var table2 = document.createElement('table');
        for (var i = 0; i < jsonData.length; i++) {
            var dataRow = table2.insertRow(i);
            for (var j = 0; j < 3; j++) {
                var td = dataRow.insertCell();
                if (j == 0 ) {
                    td.innerHTML = jsonData[i][j];
                } else if(i == 0) {
                    td.innerHTML = jsonData[i][j] +" + "+ jsonData[i][j+1];
                }
                else {
                    var sum = Number(jsonData[i][j]) + Number(jsonData[i][j+1]);
                    td.innerHTML = sum.toString();
                }
            }
        }
        var br = document.createElement('br');
        var p = document.createElement('p');
        p.innerHTML = "機器合併後的時間:";
        p.style.fontFamily = "DFKai-sb";
        p.style.textAlign = "left";
        excelDataDiv.appendChild(br);
        excelDataDiv.appendChild(p);
        excelDataDiv.appendChild(table2);
        threeMachine(jsonData);
    }
    const excelDataElement = document.getElementById('excelData');
    const optimizationElement = document.getElementById('optimization');
    if (jsonData[0].length - 1 === 2) {
        excelDataElement.classList.add('twomachine');
        optimizationElement.classList.add('twomachine');
    } else if (jsonData[0].length - 1 === 3) {
        excelDataElement.classList.add('threemachine');
        optimizationElement.classList.add('threemachine');
    }
}
function Show_Optimal(data) {
    // Get the div where the table will be displayed
    var optimization = document.getElementById('optimization');
    // 改 data 格式

    var formattedData = data.join('  \u2192  ')
    optimization.innerHTML = "最佳化順序：" + formattedData;
}
function threeMachine(jsonData) {

    const row = jsonData.length - 1
    const col = jsonData[1].length - 1

    // 宣告 user_jobs
    const user_jobs = new Array(row);
    for (let i = 0; i < row; i++) {
        user_jobs[i] = new Array(col);
    }

    for (var i = 1; i < jsonData.length; i++) {
        for (var j = 1; j < jsonData[1].length; j++) {
            user_jobs[i - 1][j - 1] = jsonData[i][j];
        }
    }
    // 找出每個機器的最短和最長加工時間
    let minTimeMachine1 = Math.min(...user_jobs.map(job => job[0]));
    let maxTimeMachine2 = Math.max(...user_jobs.map(job => job[1]));
    let minTimeMachine3 = Math.min(...user_jobs.map(job => job[2]));

    // 檢查條件
    if (minTimeMachine1 >= maxTimeMachine2 || minTimeMachine3 >= maxTimeMachine2) {
        // 如果滿足任一條件，則繼續執行
        console.log("條件滿足，可以繼續執行");
    } else {
        // 如果兩個條件都不滿足，則停止執行並返回一個錯誤訊息
        //網頁跳出警告視窗並顯示每個機器的最短和最長加工時間
        alert("條件不滿足，請檢查每個機器的最短和最長加工時間"+'\n'+"機器1最短加工時間："+minTimeMachine1+'\n'+"機器2最長加工時間："+maxTimeMachine2+'\n'+"機器3最短加工時間："+minTimeMachine3);
        location.reload();
        return;
    }
    // for (var i = 0; i < user_jobs.length; i++) {
    //     for (var j = 0; j < user_jobs[0].length; j++) {
    //         console.log(user_jobs[i][j]);
    //     }
    // }
    //複製陣列
    let Ojob = [...user_jobs];
    console.log("用戶輸入的工作：", Ojob);
    let user_optimal_schedule = johnsonRule3(user_jobs);
    console.log("最佳排程的工作順序：", user_optimal_schedule);
    console.log("最佳排程的工作：", user_jobs);
    Show_Optimal(user_optimal_schedule); // 印出最佳化順序

    let schedule = [];
    let time_counter_machine1 = 0;
    let time_counter_machine2 = 0;
    let time_counter_machine3 = 0;
    for (let job of user_optimal_schedule) {
        schedule.push([time_counter_machine1, time_counter_machine1 + Ojob[job - 1][0], 1, job]);
        time_counter_machine1 += Ojob[job - 1][0];
        if (time_counter_machine1 <= time_counter_machine2) {
            schedule.push([time_counter_machine2, time_counter_machine2 + Ojob[job - 1][1], 2, job]);
            time_counter_machine2 += Ojob[job - 1][1];
        } else {
            time_counter_machine2 = time_counter_machine1;
            schedule.push([time_counter_machine2, time_counter_machine2 + Ojob[job - 1][1], 2, job]);
            time_counter_machine2 += Ojob[job - 1][1];
        }
        if (time_counter_machine2 <= time_counter_machine3) {
            schedule.push([time_counter_machine3, time_counter_machine3 + Ojob[job - 1][2], 3, job]);
            time_counter_machine3 += Ojob[job - 1][2];
        } else {
            time_counter_machine3 = time_counter_machine2;
            schedule.push([time_counter_machine3, time_counter_machine3 + Ojob[job - 1][2], 3, job]);
            time_counter_machine3 += Ojob[job - 1][2];
        }
    }
    console.log(user_jobs.length, schedule);
    // test();
    //(機器數量,工作數量,排程=[開始時間,結束時間,機器,工作])
    // plotGanttChart(user_jobs[0].length, user_jobs.length, schedule,'myChart3'); // 畫圖
    plotGanttChart(user_jobs[0].length, user_jobs.length, schedule, 'myChart1', user_optimal_schedule, jsonData);
}

function twoMachine(jsonData) {

    const row = jsonData.length - 1
    const col = jsonData[1].length - 1

    // 宣告 user_jobs
    const user_jobs = new Array(row);
    for (let i = 0; i < row; i++) {
        user_jobs[i] = new Array(col);
    }

    for (var i = 1; i < jsonData.length; i++) {
        for (var j = 1; j < jsonData[1].length; j++) {
            user_jobs[i - 1][j - 1] = jsonData[i][j];
        }
    }

    // for (var i = 0; i < user_jobs.length; i++) {
    //     for (var j = 0; j < user_jobs[0].length; j++) {
    //         console.log(user_jobs[i][j]);
    //     }
    // }
    //複製陣列
    let Ojob = [...user_jobs];
    console.log("用戶輸入的工作：", Ojob);
    let userOptimalSchedule = johnsonRule2(user_jobs); // 使用 Johnson's Rule 獲得最佳排程
    console.log("最佳排程的工作順序：", userOptimalSchedule);
    console.log("最佳排程的工作：", user_jobs);
    Show_Optimal(userOptimalSchedule); // 印出最佳化順序

    let schedule = [];
    let time = [0];
    let timeCounterMachine1 = 0;
    let timeCounterMachine2 = 0;
    for (let job of userOptimalSchedule) {
        // console.log('job', job, user_jobs);
        schedule.push([timeCounterMachine1, timeCounterMachine1 + Ojob[job - 1][0], "Machine1", job.toString()]);
        timeCounterMachine1 += Ojob[job - 1][0];
        time.push(timeCounterMachine1);
        // console.log('time1', timeCounterMachine1, 'user', Ojob[job - 1][0]);
        if (timeCounterMachine1 <= timeCounterMachine2) {
            schedule.push([timeCounterMachine2, timeCounterMachine2 + Ojob[job - 1][1], "Machine2", job.toString()]);
            timeCounterMachine2 += Ojob[job - 1][1];
            time.push(timeCounterMachine2);
        } else {
            timeCounterMachine2 = timeCounterMachine1;
            // console.log(timeCounterMachine2);
            schedule.push([timeCounterMachine2, timeCounterMachine2 + Ojob[job - 1][1], "Machine2", job.toString()]);
            timeCounterMachine2 += Ojob[job - 1][1];
            time.push(timeCounterMachine2);
        }
    }
    // console.log(user_jobs.length);
    // console.log(user_jobs.length, schedule);
    // plotGanttChart(user_jobs[0].length, user_jobs.length, schedule,'myChart2'); // 畫圖
    plotGanttChart(user_jobs[0].length, user_jobs.length, schedule, 'myChart1', userOptimalSchedule,jsonData); // 畫圖
}
function test1() {
    let Data =[['Job', 'machine 1', 'machine 2'],[1, 5, 5],[2, 4, 3],[3, 8, 9],[4, 2, 7],[5, 6, 8],[6, 12, 15]];
    displayExcelData(Data);
    twoMachine(Data);
}
function test2() {
    let Data = [['Job', 'machine 1', 'machine 2', 'machine3'],[1, 10, 5, 12],[2, 5, 10, 18],[3, 7, 3, 15],[4, 1, 5, 20]];
    displayExcelData(Data);
    threeMachine(Data);
}
