//## SESSION rs0_init | mongo1 | mongodb://mongo1:27017/?directConnection=true
//@@ rs_initiate
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
})
//@@ _wait
sleep(12000)
//@@ rs_conf
rs.conf().members.map(m => ({ _id: m._id, host: m.host, priority: m.priority, votes: m.votes }))
//@@ version
db.version()
