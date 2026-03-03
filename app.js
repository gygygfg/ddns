console.log(new Date, "Running...");
const axios = require('axios');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const dns = require('dns');

// 账号数据
const hostname = 'bxsr.f3322.net';
const username = "gygygfg";
const password = "6ygv7uhb";

async function get_public_ip() {
    // 获取本机IPV4
    return new Promise(async (resolve, reject) => {
        // 尝试通过路由器获取当前IPV4
        const browser = await puppeteer.launch({
            // headless: false // uncomment this if you want to see the browser
        });
        try {
            const page = await browser.newPage();
            
            // 获取局域网IP
            let ip = execSync('ip addr show enp1s0 | grep "scope global dynamic noprefixroute"', { encoding: 'buffer' }).toString()
            // 更改最后一位为1
            ip = ip.trim().split(' ')[3]
            ip = ip.split('.')
            ip[3] = "1"

            await page.goto('http://' + ip.join('.'), { waitUntil: 'networkidle2' });
            
            // 点击继续浏览网页版
            await page.waitForSelector('#askLogin');
            await page.click('#askLogin');
            
            // 输入登录密码
            await page.waitForSelector('#password');
            await page.type('#password', 'bxsrlmjs1970ZHAN');
            
            // 点击登录
            await page.click('#login');
            
            // 等待登录成功
            await page.waitForSelector('.header-menu.pointer.tc');

            // 等待页面加载（如果需要的话）
            await page.waitForSelector('p.tc.component-overview-ifaceinfo-port--desc');

            // 选择所需的 <p> 元素并提取文本
            const public_ip = await page.evaluate(() => {
                const elements = document.querySelectorAll('p.tc.component-overview-ifaceinfo-port--desc');
                return Array.from(elements).filter(element => {
                    return !element.innerText.includes('192.168');
                }).map(element => element.innerText);
            });

            await browser.close();

            resolve(public_ip[0]); // 输出文本内容
        } catch (err) {
            await browser.close();
            reject(err);
        }
    });
}

function get_ip_address(hostname) {
    // 查询域名DNS
    return new Promise((resolve, reject) => {
        // 发起 DNS 查询
        try {
            dns.resolve(hostname, (err, addresses) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(addresses[0]);
                }
            });
        } catch (err) {
            reject(err);
        }
    })
}

function updateDyndns(hostname, myip, username, password) {
    // 更新动态DNS记录函数
    return new Promise(async (resolve, reject) => {
        // 构建请求URL和参数
        const url = 'http://members.3322.net/dyndns/update';
        const params = {
            hostname: hostname,
        };
        if (myip) {
            params.myip = myip;
        }

        // 构建Authorization头
        const credentials = `${username}:${password}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        const headers = {
            'Authorization': `Basic ${encodedCredentials}`,
            'User-Agent': `myclient/1.0 me@${hostname}`
        };

        // 发送HTTP GET请求
        try {
            const response = await axios.get(url, { params, headers });

            // 检查响应状态码
            if (response.status === 200) {
                resolve(`Dynamic DNS updated successfully to ${myip}`);
            } else {
                reject(`Failed to update Dynamic DNS: ${response.data}`);
            }
        } catch (err) {
            reject(err);
        }
    });
}

let ip_address = ''
// 根据DNS获取域名解析的IP
get_ip_address(hostname)
    .then((addresses) => {
        ip_address = addresses;
        console.log(`${hostname} IP is: `, ip_address);

        // 获取本机IPV4
        get_public_ip()
            .then((public_ip) => {
                // 如果IP变化
                if (public_ip != ip_address) {
                    // 更新DNS
                    console.log(`DNS from ${ip_address} to ${public_ip}`);
                    ip_address = public_ip;
                    updateDyndns(hostname, ip_address, username, password)
                        .then((data) => {
                            console.log(new Date + ": " + data);
                        })
                        .catch((err) => {
                            console.error(new Date + ": " + err);
                        });
                }
            })
            .catch((err) => {
                console.error(new Date + ": " + err);
            })
        // 每隔10分钟执行一次
        setInterval(() => {
            // 获取本机IPV4
            get_public_ip()
                .then((public_ip) => {
                    // 如果IP变化
                    if (public_ip != ip_address) {
                        // 更新DNS
                        console.log(`DNS from ${ip_address} to ${public_ip}`);
                        ip_address = public_ip;
                        updateDyndns(hostname, ip_address, username, password)
                            .then((data) => {
                                console.log(new Date + ": " + data);
                            })
                            .catch((err) => {
                                console.error(new Date + ": " + err);
                            });
                    }
                })
                .catch((err) => {
                    console.error(new Date + ": " + err);
                })
        }, 10 * 60 * 1000);
    })
    .catch((err) => {
        console.error(new Date + ": " + err);
    });

get_public_ip().then((data) => {
    console.log(data);
});