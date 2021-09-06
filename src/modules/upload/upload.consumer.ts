import {
  InjectQueue,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { HttpService } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { map } from 'rxjs/operators';

const xlsxFile = require('read-excel-file/node');

@Processor('UPLOAD_QUEUE')
export class UploadConsumer {
  constructor(
    @InjectQueue('UPLOAD_QUEUE') private genieQueue: Queue,
    private readonly httpService: HttpService,
  ) {}

  async submitToUser(students: Student[]) {
    const url = `http://localhost:3000/graphql`;
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    console.log(JSON.stringify(students).replace(/"(\w+)"\s*:/g, '$1:'));
    const body = JSON.stringify(students).replace(/"(\w+)"\s*:/g, '$1:');
    const data = {
      query: `mutation{createStudent(studentInput:${body}){id}}`,
    };

    await this.httpService
      .post(url, data, { headers: headersRequest })
      .pipe(
        map((results) => {
          console.log(results);
        }),
      )
      .toPromise();

    return false;

    // const query = gql`
    //  mutation{
    //   createStudent(studentInput:${student}){
    //     id
    //   }
    // }
    // `

    //   const query = gql`
    //   mutation createUser($studentArray: Student[]!) {
    //     createStudent(studentInput:$studentArray){
    //         id
    //     }
    //   }
    // `

    //    const query = gql`
    //    query getMovie($title: String!) {
    //      Movie(title: $title) {
    //        releaseDate
    //        actors {
    //          name
    //        }
    //      }
    //    }
    //  `

    //  const variables = {
    //   studentArray: students
    //  }

    // try {
    //   const data =  await request('http://localhost:3000/graphql',query,variables)
    //   console.log(JSON.stringify(data, undefined, 2))
    //   return true
    // } catch (error) {
    //   console.error(JSON.stringify(error, undefined, 2))
    //   return false
    // }
  }

  @Process()
  async processUploadJob(job: Job, done) {
    let student: Student[] = [];

    const fileName = job.data.file.filename;

    try {
      await xlsxFile(`./uploads/${fileName}`).then((rows) => {
        const columnNames = rows.shift(); // Separate first row with column names
        rows.map((row) => {
          // Map the rest of the rows into objects
          const obj: any = {}; // Create object literal for current row
          row.forEach((cell, i) => {
            obj[columnNames[i]] = cell; // Use index from current cell to get column name, add current cell to new object
          });

          const stud: Student = {
            name: obj.Name,
            dob: obj.DOB,
            email: obj.Email,
            age: this.calculateAge(obj.DOB),
          };
          student.push(stud);
        });
      });
    } catch (error) {
      console.log('error', error);
    }

    if (student.length > 0) {
      let success = await this.submitToUser(student);
      if (success) {
        done();
      } else {
        return false;
      }
    }
  }

  calculateAge(birthday: Date) {
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  @OnQueueFailed()
  async onRetryQues(job: Job, result: Error) {
    console.log('queFailed', Error);
  }

  @OnQueueCompleted()
  async onSubmitUser(job: Job, result: any) {
    // call done when finished
    console.log('processUploadJob' + job.data.file);
  }

  /*@Process()
  async processUploadJob(job: Job, done) {
    const url = `http://localhost:3000/graphql`;
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    const data = {
      query:
        'mutation{\n  createStudent(studentInput:{\n    name: "eshan933173",\n    dob: "1993-11-12",\n    email:"eshanwp@gmail.com",\n    age: 28\n  }){\n    id,\n    name,\n    dob,\n    email,\n    age\n  }\n}',
    };

    await this.httpService
      .post(url, data, { headers: headersRequest })
      .pipe(
        map((results) => {
          console.log(results);
        }),
      )
      .toPromise();
    // call done when finished
    done();
  }*/
}
