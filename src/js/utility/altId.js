
import md5 from './md5'

function getAltId() {
  var randomNumber = Math.random() + new Date().getTime();
  return md5(randomNumber.toString());
}

export default getAltId;
