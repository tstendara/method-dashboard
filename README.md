# Getting Started 

### `npm i`

In your terminal, export these values before running:
```
export METHOD_API='{METHOD_API}'
export MONGO_URI='{MONGO_URI}'
```

To start frontend: `npm run start`
To start sever: `npm run server`

Then navigate to `http://localhost:3001`

Upload your XML file and then sit back :)

The server communicates with Method API to create entities, source accounts, and destination accounts. The client will render a progress bar representing the progress for each independent step.

After this is finished, the Submit Payment & Generate Report will become enabled and allow the user to submit the pay. Once the user clicks pay, the payment stage will start. Afterwards a new button will render below Reports, allowing the user to click on the most recent report, and getting back the report.csv file containing total funds paid out per unique source accounts, total funds paid out per unique branch, and the totalPaid/status on amount failed and successful. 

## future plans:
- Better error handling to get each specific employee and their loanAccont.
- More communication when the process starts to present which step the user/all steps.
- Utilize MVC architecture for better separation of concern.
- Server side rendering. 
- Decoupled dependencies from the frontend and backend.
- TDD and CI/CD.

