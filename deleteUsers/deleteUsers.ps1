function Get-Tree($path,$Include='*'){
    @(Get-Item $pate -Include $Include -Force) +
    (Get-ChildItem $pate -Recurse -Include $Include -Force -ErrorAction SilentlyContinue)|
    sort pspath -Descending -unique
}
function Remove-Tree($path,$Include='*'){
    Get-Tree $path $Include | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
}

for($i=0;$i -lt $args.Count;$i++){
    $computer = $args[$i]
    Write-Host $computer
    
    #before deleting profiles first check if computer is online
    if($computer -ne $Env:ComputerName){
        if(!(Test-Connection -comp $computer -count 1 -quiet)){
            Write-Warning "$computer is not accessible!"
        }
    }

    #get users list
    try{
        [array]$users= Get-WmiObject -ComputerName $computer Win32_UserProfile -filter "LocalPath Like 'C:\\Users\\%'" -ea stop
    }catch{
        Write-Warning "$($error[0])"
        break
    }
    $num_users = $users.Count
    $usersFolders = @()

    #print list of Users in selected computer
    Write-Host "User profiles on $($computer):"
    for($i=0;$i -lt $num_users.Count;$i++){
        Write-Host "$($i): $(($users[$i].LocalPath).replace('C:\Users\',''))"
    }

    #start to delete
    Write-Host "Start deleting profiles:"
    for($i=0;$i -lt $num_users;$i++){
        Write-Host "$(($users[$i].LocalPath).replace('C:\Users\',''))..."
        try{
            $users[$i].Delete()
            Write-Host "Deleted successfully."
    }catch{
        Write-Host "Profile not deleted"
        $folder=($users[$i].LocalPath).replace("C:\","\\$($computer)\C$\")
        Write-Host "try delete sub folders from $($folder)..."
        try{
            if($folder|Test-Path){
                Remove-Tree $folder
            }else{
                Write-Host "Deleted successfully."
            }
        }catch{
            Write-Host "Error"
            Write-Host "$($_.Exception.ItemName)"
            Write-Host "$($_.Exception.Message)"
        }
    }   
    }
}