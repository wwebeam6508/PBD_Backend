import mongoDB from "../../configs/mongo.config.js";
import { BadRequestError } from "../../utils/api-errors.js";

// get spent and earn each month in current extract as { month , earn , spend}
const getSpentAndEarnEachMonth = async (year) => {
  try {
    // get all works and expenses in year in mongodb
    const db = await mongoDB();
    const start = year ? new Date(year, 0, 1) : null;
    const end = year ? new Date(year, 11, 32) : null;
    const works = db.collection("works");
    const expenses = db.collection("expenses");
    let pipelineWork = [];
    // where has dateEnd
    pipelineWork.push({
      $match: {
        dateEnd: { $ne: null },
      },
    });
    if (year) {
      pipelineWork.push({
        $match: {
          dateEnd: {
            $gte: start,
            $lte: end,
          },
        },
      });
    }

    // sum of profit in each month fill 0 if no data
    pipelineWork.push({
      $group: {
        _id: {
          month: { $month: "$dateEnd" },
        },
        earn: { $sum: "$profit" },
      },
    });

    // pipeline.push({
    //   $lookup: {
    //     from: "customers", // Replace with the actual collection name of customers
    //     localField: "customer.$id", // Field in the "works" collection that references the customer
    //     foreignField: "_id", // Field in the "customers" collection that is referenced
    //     as: "customer", // Field in the output document that will contain the customer data
    //   },
    // });

    const worksRes = await works.aggregate(pipelineWork).toArray();

    let pipelineExpense = [];
    if (year) {
      pipelineExpense.push({
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      });
    }
    // sum of price in each month fill 0 if no data
    pipelineExpense.push({
      $group: {
        _id: {
          month: { $month: "$date" },
        },
        // find spendWithVat sum of price in each list where currentVat > 0
        spendWithVat: {
          $sum: {
            $reduce: {
              input: "$lists",
              initialValue: 0,
              in: {
                $cond: [
                  { $gt: ["$currentVat", 0] },
                  { $add: ["$$value", "$$this.price"] },
                  "$$value",
                ],
              },
            },
          },
        },
        // find spendWithOutVat sum of price in each list where currentVat = 0
        spendWithOutVat: {
          $sum: {
            $reduce: {
              input: "$lists",
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ["$currentVat", 0] },
                  { $add: ["$$value", "$$this.price"] },
                  "$$value",
                ],
              },
            },
          },
        },
      },
    });

    const expensesRes = await expenses.aggregate(pipelineExpense).toArray();

    const month = [];
    for (let i = 0; i < 12; i++) {
      month.push({
        month: i + 1,
        earn: 0,
        spendWithVat: 0,
        spendWithOutVat: 0,
      });
    }

    worksRes.forEach((res) => {
      month[res._id.month - 1].earn = res.earn;
    });

    expensesRes.forEach((res) => {
      month[res._id.month - 1].spendWithVat = res.spendWithVat;
      month[res._id.month - 1].spendWithOutVat = res.spendWithOutVat;
    });

    return {
      month: month,
      years: await getYearsList(),
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

//get total earn from works in whole works
const getTotalEarn = async (year) => {
  try {
    const db = await mongoDB();
    const works = db.collection("works");
    const start = year ? new Date(year, 0, 1) : null;
    const end = year ? new Date(year, 11, 32) : null;
    let pipeline = [];
    // where has dateEnd
    pipeline.push({
      $match: {
        dateEnd: { $ne: null },
      },
    });
    if (year) {
      pipeline.push({
        $match: {
          dateEnd: {
            $gte: start,
            $lte: end,
          },
        },
      });
    }

    // sum of profit in each list and sum of each month to totalEarn
    pipeline.push({
      $group: {
        _id: null,
        totalEarn: {
          $sum: "$profit",
        },
      },
    });

    const worksDoc = await works.aggregate(pipeline).next();

    return worksDoc.totalEarn;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getTotalExpense = async (year) => {
  try {
    const db = await mongoDB();
    const expenses = db.collection("expenses");
    const start = year ? new Date(year, 0, 1) : null;
    const end = year ? new Date(year, 11, 32) : null;
    let pipeline = [];
    if (year) {
      pipeline.push({
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      });
    }
    // sum of whole price in each list and sum of each month to totalExpense
    pipeline.push({
      $group: {
        _id: null,
        totalExpense: {
          $sum: {
            $reduce: {
              input: "$lists",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.price"] },
            },
          },
        },
      },
    });

    const expensesRes = await expenses.aggregate(pipeline).next();

    return expensesRes.totalExpense;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getYearsReport = async () => {
  try {
    const db = await mongoDB();
    const works = db.collection("works");
    const expenses = db.collection("expenses");

    //find years that have works or expenses in aggregate
    const pipelineWork = [];
    // get sum of profit in each year
    //where has dateEnd
    pipelineWork.push({
      $match: {
        dateEnd: { $ne: null },
      },
    });
    pipelineWork.push({
      $group: {
        _id: {
          year: { $year: "$dateEnd" },
        },
        totalEarn: {
          $sum: "$profit",
        },
      },
    });

    const pipelineExpense = [];
    // get sum of price in each year
    pipelineExpense.push({
      $group: {
        _id: {
          year: { $year: "$date" },
        },
        totalExpense: {
          $sum: {
            $reduce: {
              input: "$lists",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.price"] },
            },
          },
        },
      },
    });

    const worksRes = await works.aggregate(pipelineWork).toArray();
    const expensesRes = await expenses.aggregate(pipelineExpense).toArray();

    const yearsReport = [];
    worksRes.forEach((res) => {
      yearsReport.push({
        year: res._id.year,
        totalEarn: res.totalEarn,
        totalExpense: 0,
      });
    });
    expensesRes.forEach((res) => {
      const index = yearsReport.findIndex((year) => year.year === res._id.year);
      if (index !== -1) {
        yearsReport[index].totalExpense = res.totalExpense;
      } else {
        yearsReport.push({
          year: res._id.year,
          totalEarn: 0,
          totalExpense: res.totalExpense,
        });
      }
    });
    yearsReport.sort((a, b) => a.year - b.year);

    return yearsReport;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getTotalWorks = async () => {
  try {
    const db = await mongoDB();
    const works = db.collection("works");
    // find total work unfinished
    let pipeline = [];
    pipeline.push({
      $group: {
        _id: null,
        totalWorkUnfinished: {
          $sum: {
            $cond: [{ $eq: ["$dateEnd", null] }, 1, 0],
          },
        },
        totalWork: {
          $sum: 1,
        },
      },
    });
    const worksDoc = await works.aggregate(pipeline).next();
    return {
      totalWork: worksDoc.totalWork,
      totalWorkUnfinished: worksDoc.totalWorkUnfinished,
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getWorkCustomer = async () => {
  try {
    const db = await mongoDB();
    const works = db.collection("works");
    // find total work of each customer
    let pipeline = [];

    //where has dateEnd
    pipeline.push({
      $match: {
        dateEnd: { $ne: null },
      },
    });

    pipeline.push({
      $lookup: {
        from: "customers", // Replace with the actual collection name of customers
        localField: "customer.$id", // Field in the "works" collection that references the customer
        foreignField: "_id", // Field in the "customers" collection that is referenced
        as: "customer", // Field in the output document that will contain the customer data
      },
    });

    pipeline.push({
      $group: {
        _id: "$customer",
        name: {
          $first: "$customer.name",
        },
        // get customer name by customer $id
        workCount: {
          $sum: 1,
        },
        // profit of each customer by profit not list
        totalEarn: {
          $sum: "$profit",
        },
      },
    });

    const worksRes = await works.aggregate(pipeline).toArray();
    let customerWork = [];
    let customerMoney = [];
    let totalWorks = 0;
    let totalEarn = 0;
    worksRes.forEach((res) => {
      // random color for each customer prevent 255,255,255
      const color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)})`;
      customerWork.push({
        name: res.name[0],
        workCount: res.workCount,
        color: color,
        ratio: 0,
      });
      totalWorks += res.workCount;
      customerMoney.push({
        name: res.name[0],
        totalEarn: res.totalEarn,
        color: color,
        ratio: 0,
      });
      totalEarn += res.totalEarn;
    });
    // calculate ratio of each customer
    customerWork.forEach((res) => {
      res.ratio = ((res.workCount / totalWorks) * 100).toFixed(2);
    });
    customerMoney.forEach((res) => {
      res.ratio = ((res.totalEarn / totalEarn) * 100).toFixed(2);
    });

    //sort customer by total work desc
    customerWork.sort((a, b) => b.workCount - a.workCount);
    //sort customer by total profit desc
    customerMoney.sort((a, b) => b.totalProfit - a.totalProfit);

    return {
      customerWork: customerWork,
      customerMoney: customerMoney,
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getYearsList = async () => {
  try {
    const db = await mongoDB();
    const works = db.collection("works");
    const expenses = db.collection("expenses");

    //find years that have works or expenses in aggregate
    const pipelineWork = [];
    pipelineWork.push({
      $group: {
        _id: {
          year: { $year: "$date" },
        },
      },
    });
    const pipelineExpense = [];
    pipelineExpense.push({
      $group: {
        _id: {
          year: { $year: "$date" },
        },
      },
    });

    const worksRes = await works.aggregate(pipelineWork).toArray();
    const expensesRes = await expenses.aggregate(pipelineExpense).toArray();

    const years = [];

    worksRes.forEach((res) => {
      years.push(res._id.year);
    });
    expensesRes.forEach((res) => {
      if (!years.includes(res._id.year)) {
        years.push(res._id.year);
      }
    });
    //sort year desc
    years.sort((a, b) => b - a);
    return years;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  getSpentAndEarnEachMonth,
  getTotalEarn,
  getTotalExpense,
  getYearsReport,
  getTotalWorks,
  getWorkCustomer,
};
