#!/usr/bin/env bash

# This is used by installer scripts to set up docker machines that it will need
target_docker_name=$1

if [ -z "$target_docker_name" ]
then
    >&2 echo "[docker-setup] you need to pass in the name of the machine"
    exit 4
fi

machine_state=`docker-machine ls --format "{{.State}}" --filter "name=$target_docker_name"`

echo "[docker-setup] Current State of machine $target_docker_name : $machine_state"

if [ -z "$machine_state" ]
then
    echo "[docker-setup] No docker machine exists for $target_docker_name"
    docker-machine create --driver=virtualbox --virtualbox-memory="2048" --virtualbox-cpu-count "2" $target_docker_name
    if [ $? != 0 ]
    then
        echo "[docker-setup] Unable to create machine for $target_docker_name"
        exit 1
    else
        exit 0
    fi
fi

# Docker machine states can be found at:
# https://github.com/docker/machine/blob/master/libmachine/state/state.go

if [ "$machine_state" == "Timeout" ]; then
    >&2 echo "[docker-setup] The $target_docker_name machine is in an Timeout state"
    >&2 echo "[docker-setup] This normally happens when SSH to the virtual box fails. "
    >&2 echo "[docker-setup] Check inside virtual box GUI and see whats going on"
    >&2 echo "[docker-setup] with the VM"
    exit 3
fi

if [ "$machine_state" == "Error" ]; then
    >&2 echo "[docker-setup] The $target_docker_name machine is in an error state"
    >&2 echo "[docker-setup] Did you accidentally delete the virtual machine ?"
    >&2 echo "[docker-setup] You can try: docker-machine rm $target_docker_name "
    >&2 echo "[docker-setup] and try this script again "
    exit 2
fi

if [ "$machine_state" == "Saved" ]; then
    echo "[docker-setup] Re-Starting $target_docker_name"
    docker-machine restart $target_docker_name
    if [ $? != 0 ]
    then
        echo "[docker-setup] Unable to restart machine for $target_docker_name"
        exit 1
    else
        exit 0
    fi
fi

if [ "$machine_state" == "Stopped" ] || [ "$machine_state" == "Paused" ]; then
    echo "[docker-setup] Starting $target_docker_name"
    docker-machine start $target_docker_name
    if [ $? != 0 ]
    then
        echo "[docker-setup] Unable to start machine for $target_docker_name"
        exit 1
    else
        exit 0
    fi
fi

if [ "$machine_state" == "Starting" ]; then
    echo "[docker-setup] Machine is starting. run this script again after it starts"
    exit 3
fi

if [ "$machine_state" == "Running" ]; then
    echo "[docker-setup] Machine is running and ready to go"
    exit 0
fi

>&2 echo "[docker-setup] The $target_docker_name machine is in an unknown state $machine_state"
>&2 echo "[docker-setup] This could just mean that docker-machine is on a newer version"
>&2 echo "[docker-setup] Check how to fix that sate and update this script "

exit 2
