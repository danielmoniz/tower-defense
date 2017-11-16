import EXTERNAL from 'test'
import Unit from 'Unit'

const test = 5
console.log(test);
console.log(EXTERNAL);

const jasper = new Unit("Jasper")
jasper.talk()

jasper.moveTo(20, 40)
jasper.moveTo(40, 80)
jasper.moveTo(200, 350)