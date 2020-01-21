WD=/root/scripts/storm-cicd
REPO=https://github.com/storminteractive/storm-cicd

# Detecting process by port number
#pm2 start /root/scripts/storm-cicd/index.js --name cicd
pm2 stop cicd

rm -rf $WD
git clone $REPO $WD

npm install --cwd $WD/ --prefix $WD/
#npm install

cp /root/ssl/ssl.* $WD

pm2 restart cicd
