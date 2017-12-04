kill $(lsof -n | grep LISTEN | grep node | awk '{ print $2 }')
