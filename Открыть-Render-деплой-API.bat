@echo off
chcp 65001 >nul
echo Откроется сайт Render: войдите или зарегистрируйтесь, выберите репозиторий kompleks-project2 и подтвердите Blueprint.
echo Сервис API: https://kompleks-shelestgrez-kp2.onrender.com
start "" "https://dashboard.render.com/select-repo?type=blueprint"
exit /b 0
