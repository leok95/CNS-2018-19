// Secure pwd hash comparison (mitigating side-channel timing attacks).
module.exports = (buf1, buf2) => {
	let len;
	if (!buf1 || !buf2 || !Buffer.isBuffer(buf1) || !Buffer.isBuffer(buf2) || (len = buf1.length) !== buf2.length ) return 0;
	
	let t = 0;
	for (let i=0; i < len; i++) {
		t = t + ( buf1.readUInt8(i)^buf2.readUInt8(i) );
	}
	return (t > 0) ? 0 : 1;
};
