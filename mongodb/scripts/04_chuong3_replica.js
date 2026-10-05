//## SESSION rs_primary | mongo1 | mongodb://mongo1:27017/QLThietBi?directConnection=true
//@@ rs_status
rs.status().members.map(m => ({
  name: m.name, stateStr: m.stateStr, health: m.health,
  syncSourceHost: m.syncSourceHost, optimeDate: m.optimeDate
}))
//@@ hello_primary
(({ setName, primary, me, isWritablePrimary, secondary, hosts }) =>
  ({ setName, primary, me, isWritablePrimary, secondary, hosts }))(db.hello())
//@@ write_majority
db.kiemtra_saochep.insertOne(
  { noiDung: "Ghi tại Primary mongo1", thoiDiem: new Date() },
  { writeConcern: { w: 3, wtimeout: 5000 } }
)
//@@ oplog_entry
db.getSiblingDB("local").oplog.rs.find(
  { ns: "QLThietBi.kiemtra_saochep", op: "i" },
  { _id: 0, op: 1, ns: 1, o: 1, ts: 1 }
).sort({ $natural: -1 }).limit(1)
//@@ _sleep_lag
sleep(3000)
//@@ repl_info
rs.printReplicationInfo()
//@@ repl_lag
rs.printSecondaryReplicationInfo()

//## SESSION rs_secondary2 | mongo2 | mongodb://mongo2:27017/QLThietBi?directConnection=true
//@@ hello_secondary
(({ me, isWritablePrimary, secondary, primary }) => ({ me, isWritablePrimary, secondary, primary }))(db.hello())
//@@ sec_counts
({ products: db.products.countDocuments(), makers: db.makers.countDocuments() })
//@@ sec_find_test
db.kiemtra_saochep.find({}, { _id: 0, noiDung: 1 })
//@@ sec_find_2001
db.products.findOne({ model: 2001 }, { _id: 0, maker: 1, model: 1, specs: 1, price: 1 })
//@@ sec_write
db.products.insertOne({ maker: "X", model: 9002, type: "pc" })
//@@ dbhash_mongo2
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).collections

//## SESSION rs_secondary3 | mongo3 | mongodb://mongo3:27017/QLThietBi?directConnection=true
//@@ sec3_counts
({ products: db.products.countDocuments(), makers: db.makers.countDocuments() })
//@@ dbhash_mongo3
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).collections

//## SESSION rs_primary_hash | mongo1 | mongodb://mongo1:27017/QLThietBi?directConnection=true
//@@ dbhash_mongo1
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).collections

//## SHELL
//@@ stop_mongo1
docker stop mongo1 && sleep 20 && docker ps -a --filter name=mongo1 --format "{{.Names}}: {{.Status}}"

//## SESSION rs_failover | mongo2 | mongodb://mongo2:27017,mongo3:27017/QLThietBi?replicaSet=rs0
//@@ failover_status
rs.status().members.map(m => ({ name: m.name, stateStr: m.stateStr, health: m.health }))
//@@ failover_write
db.kiemtra_saochep.insertOne(
  { noiDung: "Ghi trong lúc mongo1 dừng", thoiDiem: new Date() },
  { writeConcern: { w: "majority" } }
)
//@@ failover_read
db.products.countDocuments({ type: "laptop" })

//## SHELL
//@@ start_mongo1
docker start mongo1 && sleep 30 && docker ps --filter name=mongo1 --format "{{.Names}}: {{.Status}}"

//## SESSION rs_recover | mongo1 | mongodb://mongo1:27017/QLThietBi?directConnection=true
//@@ recover_status
rs.status().members.map(m => ({ name: m.name, stateStr: m.stateStr, health: m.health }))
//@@ recover_data
db.kiemtra_saochep.find({}, { _id: 0, noiDung: 1 })
//@@ recover_cleanup
db.kiemtra_saochep.drop()
//@@ _sleep
sleep(3000)
//@@ dbhash_final_mongo1
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).md5

//## SESSION rs_final2 | mongo2 | mongodb://mongo2:27017/QLThietBi?directConnection=true
//@@ dbhash_final_mongo2
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).md5
//@@ final_collections_mongo2
db.getCollectionNames()

//## SESSION rs_final3 | mongo3 | mongodb://mongo3:27017/QLThietBi?directConnection=true
//@@ dbhash_final_mongo3
db.runCommand({ dbHash: 1, collections: ["products", "makers"] }).md5
