$computer = $args[0]
function Decode {
    IF ($args[0] -is [System.Array]) {
        [System.Text.Encoding]::ASCII.GetString($args[0])
    }
    ELSE {
        ""        
    }
}
ForEach ($Monitor in get-wmiobject -Computer "$computer" wmimonitorid -Namespace root\wmi) {
    $name = Decode $Monitor.UserFriendlyName -notmatch 0
    $serial = Decode $Monitor.SerialNumberId -notmatch 0
    echo "$name"
}