const fs = require('fs');

const contentUD = require("./results-dynamic-UD.json");
const contentUI = require("./results-dynamic-UI.json");

function compute(type, content)
{
    const repetitions = content["r"];
    const dataset = content["dataset"]
    const gestures = content["gestures"]
    const data = content["data"][0]["data"]
    
    console.log(type);
    // console.log(repetitions);
    // console.log(dataset);
    // console.log(gestures);
    // console.log(data);

    for(let i in data)
    {
        const n = data[i]["n"];
        const accuracy = data[i]["accuracy"];
        const time = data[i]["time"];
        const matrix = data[i]["confusionMatrix"];

        console.log("N: \t\t", n);
        console.log("Accuracy: \t", Number(accuracy * 100).toFixed(2), " %");
        console.log("Time: \t\t", Number(time).toFixed(2), " s");

        let csvContent = ",";

        for(let i = 0; i < gestures.length; i++) csvContent += gestures[i].substring(0,8) + ",";
        csvContent += "\n";

        for(let i = 0; i < matrix.length; i++) {
            csvContent += gestures[i].substring(0,8);
            for(let j = 0; j < matrix[i].length; j++) {
                csvContent +=  "," + matrix[i][j];
            }
            csvContent += "\n";
        }
        for(let i = 0; i < matrix.length; i++)
        {
            let sum = 0;
            for(let j = 0; j < matrix.length; j++) sum += matrix[i][j];

            csvContent +=  "," + matrix[i][i] / sum;
        }

        fs.writeFileSync("./matrix_" + dataset + "_" + n + ".csv", csvContent, (err) => { if (err) console.error(err); });
    }
}

console.clear();

compute("User Dependent", contentUD[0]);
compute("User Independent", contentUI[0]);