function uploadcsv () {};

/*------ Method for read uploded csv file ------*/
uploadcsv.prototype.getCsv = function(e) {

  let input = document.getElementById('csv-file');
  input.addEventListener('change', function() {

    if (this.files && this.files[0]) {

      var myFile = this.files[0];
      var reader = new FileReader();

      reader.addEventListener('load', function (e) {

        let csvdata = e.target.result;
        parseCsv.getParsecsvdata(csvdata); // calling function for parse csv data
      });

      reader.readAsBinaryString(myFile);
    }
  });
}

/*------- Method for parse csv data and display --------------*/
uploadcsv.prototype.getParsecsvdata = function(data) {

  let parsedata = [];

  let newLinebrk = data.split("\n");
  for(let i = 0; i < newLinebrk.length; i++) {

    parsedata.push(newLinebrk[i].split(","))
  }

  console.table(parsedata);
}

var parseCsv = new uploadcsv();
parseCsv.getCsv();