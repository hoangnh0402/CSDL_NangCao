//## SESSION cfg_init | cfgsvr1 | mongodb://cfgsvr1:27019/?directConnection=true
//@@ cfg_initiate
rs.initiate({
  _id: "cfgrs",
  configsvr: true,
  members: [
    { _id: 0, host: "cfgsvr1:27019" },
    { _id: 1, host: "cfgsvr2:27019" },
    { _id: 2, host: "cfgsvr3:27019" }
  ]
})

//## SESSION shard1_init | shard1a | mongodb://shard1a:27018/?directConnection=true
//@@ shard1_initiate
rs.initiate({
  _id: "shard1rs",
  members: [
    { _id: 0, host: "shard1a:27018", priority: 2 },
    { _id: 1, host: "shard1b:27018" },
    { _id: 2, host: "shard1c:27018" }
  ]
})

//## SESSION shard2_init | shard2a | mongodb://shard2a:27018/?directConnection=true
//@@ shard2_initiate
rs.initiate({
  _id: "shard2rs",
  members: [
    { _id: 0, host: "shard2a:27018", priority: 2 },
    { _id: 1, host: "shard2b:27018" },
    { _id: 2, host: "shard2c:27018" }
  ]
})
//@@ _wait
sleep(15000)

//## SHELL
//@@ _restart_mongos
docker restart mongos > /dev/null && sleep 10 && echo ok

//## SESSION mongos_setup | mongos | mongodb://mongos:27017/
//@@ add_shard1
sh.addShard("shard1rs/shard1a:27018,shard1b:27018,shard1c:27018")
//@@ add_shard2
sh.addShard("shard2rs/shard2a:27018,shard2b:27018,shard2c:27018")
//@@ list_shards
db.adminCommand({ listShards: 1 }).shards.map(s => ({ _id: s._id, host: s.host, state: s.state }))
//@@ use_db
use QLThietBi
//@@ enable_sharding
sh.enableSharding("QLThietBi", "shard1rs")
//@@ create_products
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["maker", "model", "type"],
      properties: {
        maker: { bsonType: "string" },
        model: { bsonType: "number" },
        type:  { enum: ["pc", "laptop", "printer"] },
        price: { bsonType: "number", minimum: 0 },
        specs: { bsonType: "object" }
      }
    }
  }
})
//@@ zone_add
sh.addShardToZone("shard1rs", "NSX_A_D");
sh.addShardToZone("shard2rs", "NSX_E_H")
//@@ zone_range1
sh.updateZoneKeyRange(
  "QLThietBi.products",
  { maker: MinKey, model: MinKey },
  { maker: "E", model: MinKey },
  "NSX_A_D"
)
//@@ zone_range2
sh.updateZoneKeyRange(
  "QLThietBi.products",
  { maker: "E", model: MinKey },
  { maker: MaxKey, model: MaxKey },
  "NSX_E_H"
)
//@@ shard_index
db.products.createIndex({ maker: 1, model: 1 }, { unique: true, name: "uq_maker_model" })
//@@ shard_collection
sh.shardCollection("QLThietBi.products", { maker: 1, model: 1 }, true)
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
//@@ build_makers
db.products.aggregate([
  { $sort: { model: 1 } },
  { $group: { _id: "$maker", products: { $push: { model: "$model", type: "$type" } } } },
  { $sort: { _id: 1 } },
  { $out: "makers" }
])
//@@ counts
({ products: db.products.countDocuments(), makers: db.makers.countDocuments() })
//@@ verify_sum
db.products.aggregate([
  { $group: { _id: "$type", soLuong: { $sum: 1 }, tongGia: { $sum: "$price" } } },
  { $sort: { _id: 1 } }
])

//## SESSION mongos_check | mongos | mongodb://mongos:27017/QLThietBi
//@@ _wait_balancer
sleep(5000)
//@@ shard_distribution
db.products.getShardDistribution()
//@@ sharded_data_distribution
db.getSiblingDB("admin").aggregate([
  { $shardedDataDistribution: {} },
  { $match: { ns: "QLThietBi.products" } }
]).toArray()[0].shards
//@@ chunks
db.getSiblingDB("config").chunks.find(
  { uuid: db.getSiblingDB("config").collections.findOne({ _id: "QLThietBi.products" }).uuid },
  { _id: 0, min: 1, max: 1, shard: 1 }
).sort({ min: 1 })
//@@ zones_list
db.getSiblingDB("config").tags.find({}, { _id: 0, ns: 1, min: 1, max: 1, tag: 1 })
//@@ balancer_state
({ balancerEnabled: sh.getBalancerState(), balancerRunning: sh.isBalancerRunning().mode })
//@@ makers_location
db.getSiblingDB("config").databases.findOne({ _id: "QLThietBi" }, { _id: 1, primary: 1 })
//@@ sh_status
sh.status()
//@@ explain_maker_A
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => ({ shard: s.shardName, plan: s.winningPlan.stage + " <- " + (s.winningPlan.inputStage ? s.winningPlan.inputStage.stage : "") })),
  nReturned: e.executionStats.nReturned
}))(db.products.find({ maker: "A" }).explain("executionStats"))
//@@ explain_maker_model
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => s.shardName),
  nReturned: e.executionStats.nReturned
}))(db.products.find({ maker: "E", model: 2001 }).explain("executionStats"))
//@@ explain_type
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => s.shardName),
  nReturned: e.executionStats.nReturned,
  nReturnedPerShard: e.executionStats.executionStages.shards.map(s => ({ shard: s.shardName, n: s.nReturned }))
}))(db.products.find({ type: "laptop" }).explain("executionStats"))
//@@ explain_range
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => s.shardName),
  nReturned: e.executionStats.nReturned
}))(db.products.find({ maker: { $in: ["F", "G", "H"] } }).explain("executionStats"))
//@@ explain_model_only
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => s.shardName),
  nReturned: e.executionStats.nReturned
}))(db.products.find({ model: 2001 }).explain("executionStats"))
//@@ agg_via_mongos
db.products.aggregate([
  { $group: { _id: "$maker", soSanPham: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])

//## SESSION shard1_a | shard1a | mongodb://shard1a:27018/QLThietBi?directConnection=true
//@@ s1a_role
(({ setName, me, isWritablePrimary }) => ({ setName, me, isWritablePrimary }))(db.hello())
//@@ s1a_count
db.products.aggregate([{ $group: { _id: "$maker", n: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray()
//@@ s1a_total
({ products: db.products.countDocuments(), makers: db.makers.countDocuments() })
//@@ s1a_hash
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).collections

//## SESSION shard1_b | shard1b | mongodb://shard1b:27018/QLThietBi?directConnection=true
//@@ s1b_role
(({ setName, me, isWritablePrimary, secondary }) => ({ setName, me, isWritablePrimary, secondary }))(db.hello())
//@@ s1b_total
({ products: db.products.countDocuments(), makers: db.makers.countDocuments() })
//@@ s1b_hash
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).collections

//## SESSION shard1_c | shard1c | mongodb://shard1c:27018/QLThietBi?directConnection=true
//@@ s1c_total
({ products: db.products.countDocuments(), makers: db.makers.countDocuments() })
//@@ s1c_hash
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).collections

//## SESSION shard2_a | shard2a | mongodb://shard2a:27018/QLThietBi?directConnection=true
//@@ s2a_role
(({ setName, me, isWritablePrimary }) => ({ setName, me, isWritablePrimary }))(db.hello())
//@@ s2a_count
db.products.aggregate([{ $group: { _id: "$maker", n: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray()
//@@ s2a_total
({ products: db.products.countDocuments(), collections: db.getCollectionNames() })
//@@ s2a_hash
db.runCommand({ dbHash: 1, collections: ["products"] }).collections

//## SESSION shard2_b | shard2b | mongodb://shard2b:27018/QLThietBi?directConnection=true
//@@ s2b_total
({ products: db.products.countDocuments() })
//@@ s2b_hash
db.runCommand({ dbHash: 1, collections: ["products"] }).collections

//## SESSION shard2_c | shard2c | mongodb://shard2c:27018/QLThietBi?directConnection=true
//@@ s2c_total
({ products: db.products.countDocuments() })
//@@ s2c_hash
db.runCommand({ dbHash: 1, collections: ["products"] }).collections

//## SHELL
//@@ stop_shard1a
docker stop shard1a && sleep 20 && docker ps -a --filter name=shard1a --format "{{.Names}}: {{.Status}}"

//## SESSION mongos_ha | mongos | mongodb://mongos:27017/QLThietBi
//@@ ha_count
({ tongSanPham: db.products.countDocuments(), sanPhamNSX_A: db.products.countDocuments({ maker: "A" }) })
//@@ ha_write
db.products.updateOne({ maker: "A", model: 2004 }, { $set: { price: 1199 } })
//@@ ha_write_check
db.products.findOne({ maker: "A", model: 2004 }, { _id: 0, maker: 1, model: 1, price: 1 })
//@@ ha_write_revert
db.products.updateOne({ maker: "A", model: 2004 }, { $set: { price: 1150 } })

//## SESSION shard1_status | shard1b | mongodb://shard1b:27018/?directConnection=true
//@@ ha_rs_status
rs.status().members.map(m => ({ name: m.name, stateStr: m.stateStr, health: m.health }))

//## SHELL
//@@ start_shard1a
docker start shard1a && sleep 30 && docker ps --filter name=shard1a --format "{{.Names}}: {{.Status}}"

//## SESSION shard1_status2 | shard1a | mongodb://shard1a:27018/QLThietBi?directConnection=true
//@@ ha_rs_status2
rs.status().members.map(m => ({ name: m.name, stateStr: m.stateStr, health: m.health }))
//@@ ha_s1a_count
db.products.findOne({ maker: "A", model: 2004 }, { _id: 0, maker: 1, model: 1, price: 1 })

//## SESSION mongos_hashed | mongos | mongodb://mongos:27017/QLThietBi
//@@ hashed_shard
sh.shardCollection("QLThietBi.products_hashed", { model: "hashed" })
//@@ hashed_copy
db.products.aggregate([
  { $project: { _id: 0 } },
  { $merge: { into: "products_hashed" } }
])
//@@ hashed_distribution
db.getSiblingDB("admin").aggregate([
  { $shardedDataDistribution: {} },
  { $match: { ns: "QLThietBi.products_hashed" } }
]).toArray()[0].shards.map(s => ({ shardName: s.shardName, numOwnedDocuments: s.numOwnedDocuments }))
//@@ hashed_explain_maker
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => s.shardName)
}))(db.products_hashed.find({ maker: "A" }).explain())
//@@ hashed_explain_model
(e => ({
  stage: e.queryPlanner.winningPlan.stage,
  shards: e.queryPlanner.winningPlan.shards.map(s => s.shardName)
}))(db.products_hashed.find({ model: 2001 }).explain())
//@@ hashed_drop
db.products_hashed.drop()
