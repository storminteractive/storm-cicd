#WD=/root/scripts/storm-cicd
#REPO=https://github.com/storminteractive/storm-cicd

# Detecting process by port number
#pm2 start /root/scripts/storm-cicd/index.js --name cicd

pm2 stop cicd
git pull
npm install 
pm2 restart cicd
pm2 logs cicd


#cp /root/ssl/ssl.* $WD
