//## SESSION ch1 | mongo1 | mongodb://mongo1:27017/?directConnection=true
//@@ use_db
use QLThietBi
//@@ create_products
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["maker", "model", "type"],
      properties: {
        maker: { bsonType: "string", description: "Mã nhà sản xuất" },
        model: { bsonType: "number", description: "Mã model sản phẩm" },
        type:  { enum: ["pc", "laptop", "printer"], description: "Loại sản phẩm" },
        price: { bsonType: "number", minimum: 0 },
        specs: { bsonType: "object" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
})
//@@ index_model
db.products.createIndex({ model: 1 }, { unique: true, name: "uq_model" })
//@@ insert_products
db.products.insertMany([
  { maker: "A", model: 1001, type: "pc" },
  { maker: "A", model: 1002, type: "pc" },
  { maker: "A", model: 1003, type: "pc" },
  { maker: "A", model: 2004, type: "laptop", specs: { speed: 2.00, ram: 512,  hd: 60,  screen: 13.3 }, price: 1150 },
  { maker: "A", model: 2005, type: "laptop", specs: { speed: 2.16, ram: 1024, hd: 120, screen: 17.0 }, price: 2500 },
  { maker: "A", model: 2006, type: "laptop", specs: { speed: 2.00, ram: 2048, hd: 80,  screen: 15.4 }, price: 1700 },
  { maker: "B", model: 1004, type: "pc" },
  { maker: "B", model: 1005, type: "pc" },
  { maker: "B", model: 1006, type: "pc" },
  { maker: "B", model: 2007, type: "laptop", specs: { speed: 1.83, ram: 1024, hd: 120, screen: 13.3 }, price: 1429 },
  { maker: "C", model: 1007, type: "pc" },
  { maker: "D", model: 1008, type: "pc" },
  { maker: "D", model: 1009, type: "pc" },
  { maker: "D", model: 1010, type: "pc" },
  { maker: "D", model: 3004, type: "printer", specs: { color: true,  type: "ink-jet" }, price: 120 },
  { maker: "D", model: 3005, type: "printer", specs: { color: false, type: "laser" },   price: 120 },
  { maker: "E", model: 1011, type: "pc" },
  { maker: "E", model: 1012, type: "pc" },
  { maker: "E", model: 1013, type: "pc" },
  { maker: "E", model: 2001, type: "laptop", specs: { speed: 2.00, ram: 2048, hd: 240, screen: 20.1 }, price: 3673 },
  { maker: "E", model: 2002, type: "laptop", specs: { speed: 1.73, ram: 1024, hd: 80,  screen: 17.0 }, price: 949 },
  { maker: "E", model: 2003, type: "laptop", specs: { speed: 1.80, ram: 512,  hd: 60,  screen: 15.4 }, price: 549 },
  { maker: "E", model: 3001, type: "printer", specs: { color: true,  type: "ink-jet" }, price: 99 },
  { maker: "E", model: 3002, type: "printer", specs: { color: false, type: "laser" },   price: 239 },
  { maker: "E", model: 3003, type: "printer", specs: { color: true,  type: "laser" },   price: 899 },
  { maker: "F", model: 2008, type: "laptop", specs: { speed: 1.60, ram: 1024, hd: 100, screen: 15.4 }, price: 900 },
  { maker: "F", model: 2009, type: "laptop", specs: { speed: 1.60, ram: 512,  hd: 80,  screen: 14.1 }, price: 680 },
  { maker: "G", model: 2010, type: "laptop", specs: { speed: 2.00, ram: 2048, hd: 160, screen: 15.4 }, price: 2300 },
  { maker: "H", model: 3006, type: "printer", specs: { color: true,  type: "ink-jet" }, price: 100 },
  { maker: "H", model: 3007, type: "printer", specs: { color: true,  type: "laser" },   price: 200 }
])
//@@ count_all
db.products.countDocuments()
//@@ count_by_type
db.products.aggregate([
  { $group: { _id: "$type", soLuong: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
//@@ build_makers
db.products.aggregate([
  { $sort: { model: 1 } },
  { $group: { _id: "$maker", products: { $push: { model: "$model", type: "$type" } } } },
  { $sort: { _id: 1 } },
  { $out: "makers" }
])
//@@ makers_count
db.makers.countDocuments()
//@@ makers_find_A
db.makers.findOne({ _id: "A" })
//@@ makers_list
db.makers.find({}, { _id: 1, soSanPham: { $size: "$products" } })
//@@ invalid_insert
db.products.insertOne({ maker: "Z", model: 9001, type: "tablet" })
//@@ dup_insert
db.products.insertOne({ maker: "A", model: 1001, type: "pc" })
//@@ findone_2001
db.products.findOne({ model: 2001 })
//@@ find_maker_B
db.products.find({ maker: "B" }, { _id: 0, maker: 1, model: 1, type: 1, price: 1 })
//@@ find_printer_le120
db.products.find(
  { type: "printer", price: { $lte: 120 } },
  { _id: 0, model: 1, maker: 1, price: 1 }
).sort({ price: 1, model: 1 })
//@@ find_or
db.products.find(
  { $or: [ { maker: "F" }, { maker: "G" } ] },
  { _id: 0, maker: 1, model: 1, price: 1 }
)
//@@ update_one
db.products.updateOne({ model: 2002 }, { $set: { price: 999 } })
//@@ update_one_check
db.products.findOne({ model: 2002 }, { _id: 0, model: 1, price: 1 })
//@@ update_one_revert
db.products.updateOne({ model: 2002 }, { $set: { price: 949 } })
//@@ update_many
db.products.updateMany(
  { type: "printer", "specs.type": "laser" },
  { $inc: { price: 10 } }
)
//@@ update_many_check
db.products.find(
  { type: "printer", "specs.type": "laser" },
  { _id: 0, model: 1, price: 1 }
).sort({ model: 1 })
//@@ update_many_revert
db.products.updateMany(
  { type: "printer", "specs.type": "laser" },
  { $inc: { price: -10 } }
)
//@@ update_invalid
db.products.updateOne({ model: 3001 }, { $set: { price: -5 } })
//@@ embed_ram
db.products.find(
  { type: "laptop", "specs.ram": { $gte: 2048 } },
  { _id: 0, maker: 1, model: 1, "specs.ram": 1, "specs.hd": 1, price: 1 }
)
//@@ embed_color_laser
db.products.find(
  { "specs.color": true, "specs.type": "laser" },
  { _id: 0, maker: 1, model: 1, specs: 1, price: 1 }
)
//@@ embed_exists
db.products.countDocuments({ specs: { $exists: false } })
//@@ embed_update
db.products.updateOne({ model: 2003 }, { $set: { "specs.screen": 15.6 } })
//@@ embed_update_revert
db.products.updateOne({ model: 2003 }, { $set: { "specs.screen": 15.4 } })
//@@ arr_printer_makers
db.makers.find({ "products.type": "printer" }, { _id: 1 })
//@@ arr_elemmatch
db.makers.find(
  { products: { $elemMatch: { type: "laptop", model: { $gte: 2008 } } } },
  { _id: 1, products: 1 }
)
//@@ arr_size
db.makers.find({ products: { $size: 1 } })
//@@ arr_all
db.makers.find({ "products.type": { $all: ["pc", "laptop", "printer"] } }, { _id: 1 })
//@@ arr_addtoset
db.makers.updateOne(
  { _id: "C" },
  { $addToSet: { products: { model: 1007, type: "pc" } } }
)
//@@ arr_push
db.makers.updateOne(
  { _id: "G" },
  { $push: { products: { model: 9999, type: "laptop" } } }
)
//@@ arr_push_check
db.makers.findOne({ _id: "G" })
//@@ arr_pull
db.makers.updateOne(
  { _id: "G" },
  { $pull: { products: { model: 9999 } } }
)
//@@ arr_pull_check
db.makers.findOne({ _id: "G" })
//@@ arr_positional
db.makers.find(
  { _id: "E", "products.type": "printer" },
  { "products.$": 1 }
)
//@@ verify_restore
db.products.aggregate([
  { $match: { price: { $exists: true } } },
  { $group: { _id: "$type", soLuong: { $sum: 1 }, tongGia: { $sum: "$price" } } },
  { $sort: { _id: 1 } }
])
//@@ verify_2003
db.products.findOne({ model: 2003 }, { _id: 0, model: 1, specs: 1, price: 1 })
