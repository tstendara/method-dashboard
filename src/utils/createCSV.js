const csvFormat = async({sourceAccs, branches, PaymentStatus}) => {
    const header1 = ['SourceAccounts', 'total'];
    const header2 = ['Branches', 'total'];
    const header3 = ['PaymentStatus', 'status'];
    const field1 = ['sourceAcc','total'];
    const field2 = ['branch', 'total'];
  
    const replacer = (key, value) => value === null ? '' : value; 

    let record1 = sourceAccs.map(row => field1.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    let record2 = branches.map(row => field2.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    // let record3 = PaymentStatus.map(row => field3.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));

    record1.unshift(header1.join(','));
    record1.unshift(["  "].join(','));
    record1.unshift(record2.join('\r\n'));
    record1.unshift(header2.join(','));
    // record1.unshift(["  "].join(','));
    // record1.unshift(record3.join('\r\n'));
    // record1.unshift(header3.join(','));
    let csvArray = record1.join('\r\n');
    return csvArray;
}

module.exports = { csvFormat }