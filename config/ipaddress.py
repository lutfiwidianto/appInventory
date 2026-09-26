import socket

def get_local_ip():
    # Create a temporary socket object
    temp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    try:
        # Connect the temporary socket to a remote server (Google DNS) to get the local IP address
        temp_socket.connect(('8.8.8.8', 80))
        local_ip_address = temp_socket.getsockname()[0]
    except:
        # If the above code fails, get the local IP address using the hostname of the computer
        local_ip_address = socket.gethostbyname(socket.gethostname())
    finally:
        # Close the temporary socket object
        temp_socket.close()

    return local_ip_address
