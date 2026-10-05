//## SESSION ch2 | mongo1 | mongodb://mongo1:27017/QLThietBi?directConnection=true
//@@ yc1
db.products.find(
  { type: "laptop", price: { $lt: 1000 } },
  { _id: 0, maker: 1, model: 1, "specs.speed": 1, "specs.ram": 1, "specs.hd": 1, price: 1 }
).sort({ price: 1 })
//@@ yc2
db.products.distinct("maker", { type: "laptop", "specs.hd": { $gte: 100 } })
//@@ yc3
db.products.find(
  { type: "laptop", "specs.screen": { $gte: 15.4 }, "specs.ram": { $gte: 1024 } },
  { _id: 0, maker: 1, model: 1, "specs.ram": 1, "specs.screen": 1, price: 1 }
).sort({ "specs.screen": -1, price: -1 })
//@@ yc4
db.products.find(
  { maker: "E", price: { $gte: 200, $lte: 1000 } },
  { _id: 0, model: 1, type: 1, price: 1 }
).sort({ price: 1 })
//@@ yc4_count
db.products.countDocuments({ maker: "E", price: { $gte: 200, $lte: 1000 } })
//@@ yc5
db.products.aggregate([
  { $match: { type: "laptop" } },
  { $project: {
      _id: 0, model: 1, maker: 1,
      tocDo: "$specs.speed",
      ramGB: { $divide: ["$specs.ram", 1024] },
      oCung: "$specs.hd",
      manHinh: "$specs.screen",
      phanLoai: { $cond: [ { $gte: ["$specs.speed", 2.0] }, "Hiệu năng cao", "Phổ thông" ] },
      price: 1
  } },
  { $sort: { model: 1 } }
])
//@@ yc6
db.products.aggregate([
  { $match: { type: "printer" } },
  { $project: {
      _id: 0, model: 1, maker: 1,
      congNghe: "$specs.type",
      mauIn: { $cond: [ "$specs.color", "In màu", "Đen trắng" ] },
      price: 1
  } },
  { $sort: { price: 1, model: 1 } }
])
//@@ yc7
db.products.aggregate([
  { $group: {
      _id: { maker: "$maker", type: "$type" },
      soLuong: { $sum: 1 }
  } },
  { $sort: { "_id.maker": 1, "_id.type": 1 } }
])
//@@ yc8
db.products.aggregate([
  { $match: { type: "laptop" } },
  { $group: {
      _id: "$maker",
      soLaptop: { $sum: 1 },
      giaTB: { $avg: "$price" },
      giaMin: { $min: "$price" },
      giaMax: { $max: "$price" }
  } },
  { $project: { soLaptop: 1, giaTB: { $round: ["$giaTB", 2] }, giaMin: 1, giaMax: 1 } },
  { $sort: { giaTB: -1 } }
])
//@@ yc9
db.products.aggregate([
  { $group: {
      _id: "$type",
      soLuong: { $sum: 1 },
      coGia: { $sum: { $cond: [ { $ifNull: ["$price", false] }, 1, 0 ] } },
      tongGia: { $sum: "$price" },
      giaTB: { $avg: "$price" }
  } },
  { $project: { soLuong: 1, coGia: 1, tongGia: 1, giaTB: { $round: ["$giaTB", 2] } } },
  { $sort: { soLuong: -1 } }
])
//@@ yc10
db.products.aggregate([
  { $match: { type: "laptop" } },
  { $group: { _id: "$specs.hd", soLaptop: { $sum: 1 }, dsModel: { $push: "$model" } } },
  { $match: { soLaptop: { $gte: 2 } } },
  { $sort: { soLaptop: -1, _id: 1 } }
])
//@@ yc11
db.products.aggregate([
  { $match: { price: { $exists: true } } },
  { $sort: { price: -1 } },
  { $limit: 3 },
  { $project: { _id: 0, maker: 1, model: 1, type: 1, price: 1 } }
])
//@@ yc12
db.products.aggregate([
  { $match: { type: "laptop" } },
  { $bucket: {
      groupBy: "$price",
      boundaries: [0, 1000, 2000, 5000],
      default: "Khác",
      output: { soLaptop: { $sum: 1 }, dsModel: { $push: "$model" }, giaTB: { $avg: "$price" } }
  } },
  { $project: { soLaptop: 1, dsModel: 1, giaTB: { $round: ["$giaTB", 2] } } }
])
//@@ yc13a
db.products.aggregate([
  { $group: { _id: "$maker", cacLoai: { $addToSet: "$type" } } },
  { $match: { cacLoai: { $all: ["laptop"], $nin: ["pc"] } } },
  { $sort: { _id: 1 } }
])
//@@ yc13b
db.products.aggregate([
  { $group: { _id: "$maker", cacLoai: { $addToSet: "$type" } } },
  { $project: { soLoai: { $size: "$cacLoai" }, cacLoai: { $sortArray: { input: "$cacLoai", sortBy: 1 } } } },
  { $match: { soLoai: { $gte: 2 } } },
  { $sort: { soLoai: -1, _id: 1 } }
])
//@@ yc14
db.makers.aggregate([
  { $match: { "products.type": "laptop" } },
  { $lookup: {
      from: "products",
      localField: "products.model",
      foreignField: "model",
      as: "chiTiet"
  } },
  { $project: {
      _id: 0, maker: "$_id",
      laptops: { $filter: { input: "$chiTiet", as: "p", cond: { $eq: ["$$p.type", "laptop"] } } }
  } },
  { $project: {
      maker: 1,
      soLaptop: { $size: "$laptops" },
      dsModel: { $sortArray: { input: "$laptops.model", sortBy: 1 } },
      giaTB: { $round: [ { $avg: "$laptops.price" }, 2 ] },
      ramMax: { $max: "$laptops.specs.ram" }
  } },
  { $sort: { maker: 1 } }
])
//@@ yc15
db.products.aggregate([
  { $match: { type: "printer" } },
  { $lookup: { from: "makers", localField: "maker", foreignField: "_id", as: "nsx" } },
  { $unwind: "$nsx" },
  { $project: {
      _id: 0, model: 1, maker: 1, price: 1,
      tongSanPhamCuaNSX: { $size: "$nsx.products" }
  } },
  { $sort: { maker: 1, model: 1 } }
])
//@@ yc16
db.makers.aggregate([
  { $match: { "products.type": "printer" } },
  { $lookup: {
      from: "products",
      let: { mk: "$_id" },
      pipeline: [
        { $match: { $expr: { $and: [ { $eq: ["$maker", "$$mk"] }, { $eq: ["$type", "printer"] } ] } } },
        { $group: {
            _id: null,
            soMayIn: { $sum: 1 },
            soMayInMau: { $sum: { $cond: ["$specs.color", 1, 0] } },
            giaThapNhat: { $min: "$price" }
        } }
      ],
      as: "thongKe"
  } },
  { $unwind: "$thongKe" },
  { $project: {
      _id: 0, maker: "$_id",
      soMayIn: "$thongKe.soMayIn",
      soMayInMau: "$thongKe.soMayInMau",
      giaThapNhat: "$thongKe.giaThapNhat"
  } }
])
