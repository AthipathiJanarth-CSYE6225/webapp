#!/bin/bash

sleep 30

sudo yum update -y

#install node version 16
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

#Permission for ec2 user
chmod 755 /home/ec2-user

#Install pm2
sudo npm install pm2@latest -g

#install mysql mariadb
sudo yum install mariadb mariadb-server -y

sudo systemctl start mariadb

sudo mysqladmin -u root password "mantra1@3"

mysqladmin -u root --password=mantra1@3 --host=localhost --port=3306 create CSYE_6225

sudo systemctl enable mariadb

# install unzip
sudo yum install unzip -y

#Get inside the application
cd ~/
sudo mkdir -p webapp
sudo chmod 755 webapp
sudo unzip webapp.zip -d ~/webapp
cd ~/webapp

sudo mkdir -p ~/logs
#Start app using pm2
sudo pm2 startup systemd --service-name webapp
sudo pm2 start index.js
sudo pm2 save
sudo pm2 list
