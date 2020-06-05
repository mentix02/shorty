#!/usr/bin/env bash

printf "Generating secret key... "
function django_secret() { python -c "import random,string;print(''.join([random.SystemRandom().choice(\"{}{}{}\".format(string.ascii_letters, string.digits, string.punctuation)) for i in range(63)]).replace('\\'','\\'\"\\'\"\\''))"; }
echo "SECRET_KEY=$(django_secret)" > ".env"
echo "done."


read -p 'Database username: ' db_user
read -sp 'Database password: ' db_password

echo ""

echo "DB_USERNAME=$db_user" >> ".env"
echo "DB_PASSWORD=$db_password" >> ".env"

printf "Making migrations... "
./manage.py makemigrations > /dev/null
echo "done."

printf "Migrating... "
./manage.py migrate > /dev/null
echo "done."
