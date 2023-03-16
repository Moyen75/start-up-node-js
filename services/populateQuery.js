module.exports = {
  async populateLookupForOrg(arr) {
    return arr.map((str) => {
      let string = str;
      if (str.includes("-settings")) string = str.split("-")[0] + "s";
      if (string === "categorys") string = "categories";
      return {
        $lookup: {
          from: str,
          localField: "orgId",
          foreignField: "orgId",
          as: string,
        },
      };
    });
  },
  doctorApi() {
    return [
      {
        $lookup: {
          from: "degree-settings",
          localField: "degrees",
          foreignField: "uid",
          as: "degrees",
        },
      },
      {
        $lookup: {
          from: "specialist-settings",
          localField: "specialist",
          foreignField: "uid",
          as: "specialist",
        },
      },
      {
        $lookup: {
          from: "department-settings",
          localField: "department",
          foreignField: "uid",
          as: "department",
        },
      },
      {
        $unwind: {
          path: "$specialist",
        },
      },
      {
        $unwind: {
          path: "$department",
        },
      },
      {
        $project: {
          "degrees._id": 0,
          "specialist._id": 0,
          "department._id": 0,
        },
      },
    ];
  },
  doctor() {
    return [
      {
        $lookup: {
          from: "doctors",
          as: "doctor",
          let: {
            req_uid: "$doctor",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$uid", "$$req_uid"],
                },
              },
            },
            {
              $lookup: {
                from: "degree-settings",
                localField: "degrees",
                foreignField: "uid",
                as: "degrees",
              },
            },
            {
              $lookup: {
                from: "specialist-settings",
                localField: "specialist",
                foreignField: "uid",
                as: "specialist",
              },
            },
            {
              $lookup: {
                from: "department-settings",
                localField: "department",
                foreignField: "uid",
                as: "department",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor.specialist",
        },
      },
      {
        $unwind: {
          path: "$doctor.department",
        },
      },
      {
        $project: {
          "doctor._id": 0,
          "doctor.specialist._id": 0,
          "doctor.department._id": 0,
          "doctor.degrees._id": 0,
        },
      },
    ];
  },
  patient() {
    return [
      {
        $lookup: {
          from: "patients",
          localField: "patient",
          foreignField: "uid",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
        },
      },
      {
        $project: {
          "patient._id": 0,
        },
      },
    ];
  },
  referredBy() {
    return [
      {
        $lookup: {
          from: "reference-settings",
          localField: "referredBy",
          foreignField: "uid",
          as: "referredBy",
        },
      },
      {
        $unwind: {
          path: "$referredBy",
        },
      },
      {
        $project: {
          "referredBy._id": 0,
        },
      },
    ];
  },
  anesthesia() {
    return [
      {
        $lookup: {
          from: "anesthesia-settings",
          localField: "anesthesia",
          foreignField: "uid",
          as: "anesthesia",
        },
      },
      {
        $unwind: {
          path: "$anesthesia",
        },
      },
      {
        $project: {
          "anesthesia._id": 0,
        },
      },
    ];
  },
  tests() {
    return [
      {
        $lookup: {
          from: "tests",
          localField: "tests",
          foreignField: "uid",
          as: "tests",
        },
      },
      {
        $project: {
          "tests._id": 0,
        },
      },
    ];
  },
  test() {
    return [
      {
        $lookup: {
          from: "tests",
          localField: "testId",
          foreignField: "uid",
          as: "test",
        },
      },
      {
        $unwind: {
          path: "$test",
        },
      },
      {
        $project: {
          "test._id": 0,
          testId: 0,
        },
      },
    ];
  },
  invoice() {
    return [
      {
        $lookup: {
          from: "invoices",
          localField: "invoiceId",
          foreignField: "uid",
          as: "invoice",
        },
      },
      {
        $unwind: {
          path: "$invoice",
        },
      },
      {
        $project: {
          "invoice._id": 0,
          "invoice.patient": 0,
          "invoice.tests": 0,
          "invoice.doctor": 0,
          "invoice.referredBy": 0,
          invoiceId: 0,
        },
      },
    ];
  },
  product() {
    return [
      {
        $lookup: {
          from: "product-settings",
          localField: "product",
          foreignField: "uid",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          "product._id": 0,
        },
      },
    ];
  },
  supplier() {
    return [
      {
        $lookup: {
          from: "supplier-settings",
          localField: "supplier",
          foreignField: "uid",
          as: "supplier",
        },
      },
      {
        $unwind: {
          path: "$supplier",
        },
      },
      {
        $project: {
          "supplier._id": 0,
        },
      },
    ];
  },

  staffs() {
    return [
      {
        $lookup: {
          from: "staffs",
          localField: "uid",
          foreignField: "uid",
          as: "staff",
        },
      },
      {
        $unwind: {
          path: "$staff",
        },
      },
      {
        $project: {
          "staff._id": 0,
        },
      },
    ];
  },
  organizations() {
    return [
      {
        $lookup: {
          from: "organizations",
          localField: "orgId",
          foreignField: "orgId",
          as: "organization",
        },
      },
      {
        $unwind: {
          path: "$organization",
        },
      },
      {
        $project: {
          "organization._id": 0,
          "organization.members": 0,
          "organization.roles": 0,
        },
      },
    ];
  },
  expense() {
    return [
      {
        $lookup: {
          from: "expense-settings",
          localField: "type",
          foreignField: "uid",
          as: "expense",
        },
      },
      {
        $unwind: {
          path: "$expense",
        },
      },
      {
        $project: {
          "expense._id": 0,
          type: 0,
        },
      },
    ];
  },

 
//lookups for patient ledger only
  invoices(invoiceName,invoiceType) {
    return [
      {
        '$lookup': {
          'from': 'invoices', 
          'as': invoiceName, 
          'let': {
            'req_uid': '$uid'
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$patient', '$$req_uid'
                  ]
                }, 
                invoiceType
              }
            }
          ]
        }
      }
    ];
  },
  reports() {
    return [
      {
        '$lookup': {
          'from': 'test-reports', 
          'as': 'reports', 
          'let': {
            'req_uid': '$uid'
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$patient', '$$req_uid'
                  ]
                }
              }
            }, {
              '$lookup': {
                'from': 'doctors', 
                'localField': 'doctor', 
                'foreignField': 'uid', 
                'as': 'doctor'
              }
            }, {
              '$lookup': {
                'from': 'tests', 
                'localField': 'testId', 
                'foreignField': 'uid', 
                'as': 'test'
              }
            }, {
              '$lookup': {
                'from': 'invoices', 
                'localField': 'invoiceId', 
                'foreignField': 'uid', 
                'as': 'invoice'
              }
            }, {
              '$unwind': {
                'path': '$test'
              }
            }, {
              '$unwind': {
                'path': '$invoice'
              }
            }, {
              '$unwind': {
                'path': '$doctor'
              }
            }, {
              '$project': {
                '_id': 0, 
                'invoiceId': 0, 
                'patient': 0, 
                'testId': 0
              }
            }
          ]
        }
      },
    ];
  },

  releases() {
    return [
      {
        $lookup: {
          from: "release-patient",
          localField: "uid",
          foreignField: "patient",
          as: "releases",
        },
      },

      {
        $project: {
          "releases._id": 0,
        },
      },
    ];
  },
  prescriptions() {
    return [
      {
        $lookup: {
          from: "prescription",
          localField: "uid",
          foreignField: "patient",
          as: "prescriptions",
        },
      },

      {
        $project: {
          "prescriptions._id": 0,
        },
      },
    ];
  },
};
