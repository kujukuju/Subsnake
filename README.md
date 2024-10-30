
## Server Setup

Upload:
  * main
  * assets/
  * subsnake.service
  * server.subsnake.xyz
  * libmongoose.a
  * libmongoose.so

chmod +x main

sudo ufw default allow incoming
sudo ufw default allow outgoing

sudo ln -s /root/subsnake.service /etc/systemd/system/subsnake.service
sudo systemctl daemon-reload
sudo systemctl enable subsnake.service
sudo systemctl start subsnake.service

sudo apt-get update
sudo apt-get install nginx
sudo apt-get install certbot python3-certbot-nginx

sudo certbot --nginx
crontab -e
    0 3 * * * certbot renew --quiet --deploy-hook "nginx -s reload"

sudo ln -s /root/server.subsnake.xyz /etc/nginx/sites-enabled/
